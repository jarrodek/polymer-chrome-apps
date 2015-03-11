Polymer('bluetooth-demo', {

  ready: function(){
    this.queryAdapterState();
  },

  deviceName: 'unknown',
  deviceAddress: 'unknown',
  adapterAvailable: undefined,
  adapterDiscovering: undefined,
  adapterPowered: undefined,

  currentDevices: [],


  queryAdapterState: function(){
    var context = this;
    this.$.log.append('Query adapter state');
    this.$.bluetooth.adapterState()
    .then(function(adapterInfo){
      console.log('queryAdapterState', adapterInfo);
      context._setAdapterInfo(adapterInfo);
    })
    .catch(function(error){
      console.error(error);
      context.$.log.append('Query adapter state error: ' + JSON.stringify(error));
    });
  },

  _setAdapterInfo: function(adapterInfo){
    this.$.log.append('New adapter info available: ' + JSON.stringify(adapterInfo));

    this.deviceName = adapterInfo.name || 'unknown';
    this.deviceAddress = adapterInfo.address || 'unknown';
    this.adapterAvailable = adapterInfo.available;
    this.adapterDiscovering = adapterInfo.discovering;
    this.adapterPowered = adapterInfo.powered;
  },

  onAdapterStateChanged: function(e, details, sender){
    console.log('onAdapterStateChanged', details);
    this._setAdapterInfo(details);
    this.$.log.append('Adapther state changed: ' + JSON.stringify(details));
  },

  onError: function(e, details, sender){
    console.error('onError', details);
  },

  onDeviceAdded: function(e, details, sender){
    console.log('onDeviceAdded', details);
    this.currentDevices.push(details);
  },

  onDeviceChanged: function(e, details, sender){
    console.log('onDeviceChanged', details);
    this.$.log.append('Bluetooth device changed: ' + JSON.stringify(details));
    for(var i=0,len=this.currentDevices.length; i<len; i++){
      var device = this.currentDevices[i];
      if(device.address === details.address){
        this.currentDevices[i] = device;
        return;
      }
    }
    //add as new device
    this.onDeviceAdded(e, details, sender);
  },

  onDeviceRemoved: function(e, details, sender){
    console.log('onDeviceRemoved', details);
    this.$.log.append('Bluetooth device removed: ' + JSON.stringify(details));
    this.currentDevices = this.currentDevices.filter(function(item){
      if(item.address === details.address){
        return false;
      }
      return true;
    });
  },

  onDiscoveryStateChanged: function(e, details, sender){
    console.log('onDiscoveryStateChanged', details);
    if(details.mode === 'ended'){
      this.$.log.append('Adapter is no loger searching for new devices');
    } else {
      this.$.log.append('Adapther is searching for new devices');
    }
  },

  onDevice: function(e, details, sender){
    console.log('onDevice', details);
  },

  startDiscovery: function(){
    this.$.bluetooth.startDiscovery();
  },

  stopDiscovery: function(){
    this.$.bluetooth.stopDiscovery();
  }

});
