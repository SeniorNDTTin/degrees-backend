const paginationHelper = (page?: number, limit?: number) => {
  const pagination = {
    page: 1,
    skip: 0,
    limit: 20,
  };

  if (page && limit) {
    pagination.limit = limit;
    pagination.skip = (page - 1) * limit;
  }

  return pagination;
};

export default paginationHelper;
