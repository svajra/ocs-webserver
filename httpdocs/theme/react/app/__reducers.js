const reducer = Redux.combineReducers({
  products:productsReducer,
  users:usersReducer,
  supporters:supportersReducer,
  domain:domainReducer
});

function productsReducer(state = {}, action){
  if (action.type === 'SET_PRODUCTS'){
    return action.products;
  } else {
    return state;
  }
}

function usersReducer(state = {},action){
  if (action.type === 'SET_USERS'){
    return action.users;
  } else {
    return state;
  }
}

function supportersReducer(state = {},action){
  if (action.type === 'SET_SUPPORTERS'){
    return action.supporters;
  } else {
    return state;
  }
}

function domainReducer(state = {},action){
  if (action.type === 'SET_DOMAIN'){
    return action.domain;
  } else {
    return state;
  }
}

function setProducts(products){
  return {
    type:'SET_PRODUCTS',
    products:products
  }
}

function setUsers(users){
  return {
    type:'SET_USERS',
    users:users
  }
}

function setSupporters(supporters){
  return {
    type:'SET_SUPPORTERS',
    supporters:supporters
  }
}

function setDomain(domain){
  return {
    type:'SET_DOMAIN',
    domain:domain
  }
}
