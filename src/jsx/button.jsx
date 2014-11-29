var React = require("react/addons");


var ToggleButton = React.createClass({
  getInitialState: function() {
    return { status : false } ;
  },
  handleClick: function(event) {
    this.setState({status: !this.state.status});

    var callBack = this.props.callback;
    var callFunc = new Function("Arg1", "window." + callBack + "(Arg1)" );

    var x = new Event("x");
    document.dispatchEvent( x );
    try{
      callFunc( this.state.status );
    }
    catch(e){
      console.log( "Call back function not valid");
    }

  },
  render: function() {
    var cx = React.addons.classSet;
    var classes = cx({
      'btn btn-info' : !this.state.status,
      'btn btn-success' : this.state.status
    });
    var text = this.state.status ? 'Yes' : 'No';
    return (
      <a onClick={this.handleClick} className={classes}>
      {text}. Click to toggle.
      </a>
    );
  }
});

module.exports = ToggleButton;
