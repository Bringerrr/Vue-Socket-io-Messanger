options = {
  hour: "numeric",
  minute: "numeric",
  year: "numeric",
  month: "long"
};

exports.dateToString = date => {
  if (!date instanceof Date) throw "That's was not a date";
  return date.toLocaleDateString("en-US", options);
};
