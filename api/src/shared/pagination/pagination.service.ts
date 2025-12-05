import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PaginationQuery } from './dto/pagination-query.dto';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';

@Injectable()
export class PaginationService {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request,
  ) {}
  public async paginateQuery<T>(
    paginateQuery: PaginationQuery,
    repo: Model<T>,
    aggregatePipeline?: any[],
  ): Promise<Paginated<T>> {
    const page = paginateQuery.page!;
    const limit = paginateQuery.limit!;
    const skip = (page - 1) * limit;

    let data: T[];
    let totalItems: number;

    if (aggregatePipeline && aggregatePipeline.length > 0) {
      const countResult = await repo.aggregate([
        ...aggregatePipeline,
        { $count: 'total' },
      ]);

      totalItems = countResult[0]?.total ?? 0;
      data = await repo.aggregate([
        ...aggregatePipeline,
        { $skip: skip },
        { $limit: limit },
      ]);
    } else {
      data = await repo.find({}).skip(skip).limit(limit);
      totalItems = await repo.countDocuments();
    }

    const totalPages = Math.ceil(totalItems / limit);
    const baseUrl =
      this.request.protocol + '://' + this.request.headers.host + '/';
    const newUrl = new URL(this.request.url, baseUrl);

    const nextPage = page === totalPages ? page : page + 1;
    const prevPage = page === 1 ? page : page - 1;

    return {
      data,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages,
      },
      links: {
        currentPage: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${page}`,
        firstPage: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=1`,
        lastPage: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${totalPages}`,
        nextPage: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${nextPage}`,
        previousPage: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${prevPage}`,
      },
    };
  }
}
