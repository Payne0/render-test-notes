const generateId = (notes) => {
  const id = notes.length > 0 ?
    Math.max(...notes.map(n => n.id)) + 1 :
    1;
  
  return id;
};

module.exports = {
  generateId
};

