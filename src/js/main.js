/** @jsx React.DOM */
var React = require("react");
var MyButton = require('../jsx/button.jsx');

//deprecated
//React.render(button(), document.getElementById('content'));
function render(){
  console.log( "called");
  return <MyButton />;
}

React.render(render(), document.getElementById('content'));

document.addEventListener('x', function(e){
  console.log( "Event x triggered");
});
