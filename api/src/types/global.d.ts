type Payload = {
  role: Auth;
  id: string;
  email: string;
};

type RefreshPayload = {
  id: string;
};

type Paginated<T> = {
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };

  links: {
    firstPage: string;
    lastPage: string;
    currentPage: string;
    nextPage: string;
    previousPage: string;
  };

  data: T[];
};
