Polymer('alarms-demo', {

  name: '',
  interval: 1,
  invalid: false,

  ready: function(){
    this.$.alarms.getAll();
  },

  onAlarmInfo: function(event, details, sender){
    var alarms = details.alarms;
    if(alarms.length > 0 && !(alarms.length === 1 && !alarms[0])){
      for(var i=0, len=alarms.length; i<len; i++){
        if(!alarms[i]) continue;

        this.$.log.append('Alarm is running: "' + alarms[i].name + '" and will run at: ' + new Date(alarms[i].scheduledTime) + '. Now it\'s: ' +new Date());
        console.log(alarms[i]);
      }
    } else {
      this.$.log.append('There is no running alarms.');
    }
  },

  setAlarm: function(){
    this.$.alarms.create({
      'delayInMinutes': parseInt(this.interval)
    });
    this.$.log.append('The alarm wil run in '+this.interval+' minute(s).');
  },

  getAlarm: function(){
     this.$.alarms.get();
  },

  clearAlarm: function(){
    this.$.alarms.clear();
  },

  onAlarm: function(event, details, sender){
    var alarm = details.alarm;
    if(!alarm) return;

    this.$.log.append('The alarm "'+alarm.name+'" scheduled for ' + new Date(alarm.scheduledTime) + ' has fired.');
  }
});
