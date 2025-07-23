import { SortOrder } from 'mongoose';

const sortHelper = (sortBy?: string, sortOrder?: string) => {
  const sort: {
    [key: string]: SortOrder;
  } = {};

  if (sortBy && sortOrder) {
    sort[sortBy] = sortOrder as SortOrder;
  }

  return sort;
};

export default sortHelper;
