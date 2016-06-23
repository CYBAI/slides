const _ = require('lodash');

const eslint = 'ESLINT is awesome!!!'

console.log('eslint =>', eslint)

const arrow = () => { return 'This is an arrow function' }

console.log('arrow', arrow())

const n = 3
const troy = [{}];

console.log('this is empty so that is true =>', _.isEmpty(troy[0]));
switch (n) {
  case 1:
  case 2:
  //this shouldn't break
  case 3:
  console.log('Case 3')
}
