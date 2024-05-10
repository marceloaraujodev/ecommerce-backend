// base - Product.find(email: {test@test.com})

//query search=coder&page=2&category=shortsleeves&rating[gte]=4
// &price[lte]=999&price[gte]=199

// we will receive the base and query like the param above 
class WhereClause {
  constructor(base, query){
    this.base = base;
    this.query = query;
  }

  search() {
    const searchWord = this.query.search ? {
      name: {
        $regex: this.query.search,
        $options: 'i', // i flag is to ignore capitalize letters or not
      }
    } : {}

    this.base = this.base.find({...searchWord})
    return this
  }

  filter(){
    // work on a copy of the original query object
    const copyQuery = {...this.query};

    // if you want to receive more fields to filter you can adjust here.
    delete copyQuery['search'];
    delete copyQuery['limit'];
    delete copyQuery['page'];

    // make the object into a string
    let queryString = JSON.stringify(copyQuery)

    // reges looks for any and all and changes to $gte...
    queryString = queryString.replace(/\b(gte|lte|gt|lt)\b/g, m => `$${m}`)

    const jsonQueryString = JSON.parse(queryString);

    this.base = this.base.find(jsonQueryString);

    return this;

  }

  pagination(resultPerPage){
    let currentPage = 1;

    if(this.query.page){
      currentPage = this.query.page
    }

    const skipVal = resultPerPage * (currentPage - 1)

    this.base = this.base.limit(resultPerPage).skip(skipVal);
    
    return this;
  }
}

module.exports = WhereClause;

/* It will be kind of like this, kind like the translation from the url parameters

  // Base query to retrieve all products
  const baseQuery = Product.find();

  // Query to search for products with name containing "t-shirt", category "clothing", minimum rating of 4, and price between $10 and $50
  const query = {
    search: "t-shirt",
    category: "clothing",
    rating: { gte: 4 },
    price: { gte: 10, lte: 50 }
  };

*/