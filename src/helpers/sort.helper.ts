const sortHelper = (sortBy?: string, sortOrder?: string) => {
  const sort: {
    [key: string]: string;
  } = {};

  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder;
  }

  return sort;
};

export default sortHelper;
