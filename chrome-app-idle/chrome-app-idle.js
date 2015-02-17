Polymer('chrome-app-idle', {
  /**
   * Fired when a iddle state has changed
   * The details object will have "state" key with either "active", "idle",
   * or "locked" state.
   *
   * @event state-changed
   */
  /**
   * Fired when a iddle state has been determined by querying it's state.
   * Detail's "state" key will have a value: "locked" if the system is locked,
   * "idle" if the user has not generated any input for a specified number
   * of seconds, or "active" otherwise.
   *
   * @event state
   */

  publish: {

    /**
     * Threshold, in seconds, used to determine when the system is in an idle state.
     *
     * The system is considered idle if interval seconds have elapsed
     * since the last user input detected.
     *
     * API Docs: https://developer.chrome.com/apps/idle#method-setDetectionInterval
     *
     * @attribute interval
     * @type number
     * @default 60
     */
    interval: 60
  },

  intervalChanged: function(){
    if(!this.interval) return;
    if(typeof this.interval !== 'number'){
      try{
        this.interval = parseInt(this.interval);
      } catch(e){
        this.fire('error', e);
        return;
      }
    }
    try{
      chrome.idle.setDetectionInterval(this.interval);
    } catch(e){
      this.fire('error', e);
    }
  },

  /**
   * Returns "locked" if the system is locked, "idle" if the user has not
   * generated any input for a specified number of seconds, or "active" otherwise.
   *
   * This function will fire "state" event.
   */
  state: function(){
    var context = this;
    chrome.idle.queryState(this.interval, function(state){
      context.fire('state', {'state': state});
    });

  },

  created: function(){
    var context = this;
    chrome.idle.onStateChanged.addListener(function(state){
      context.fire('state-changed', {'state': state});
    });
  }

});