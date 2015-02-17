Polymer('idle-demo', {
  interval: 60,
  state: 'unknown',
  queryState: function(){
    this.$.idle.state();
  },
  showState: function(event, details, sender){
    this.state = details.state;
    this.$.log.append('Current state is ' + this.state);
  },

  iddleError: function(event, details, sender){
    this.$.log.append(details.message, true);
  }
});


