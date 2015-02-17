
Polymer('local-filesystem', {
  /**
   * Fired when a filesystem is ready.
   *
   * @event local-filesystem
   */
  /**
   * Fired when requesting filesystem usage info.
   * @event local-filesystem-usage
   */
  /**
   * Fired when an error is received.
   *
   * @event local-error
   */

  publish: {
    /**
     * If using local filesystem storage quota must be provided.
     * User Agent need to know how many quota the app require.
     *
     * UA may not grant requested amount of disk space if e.g. "quota" is
     * bigger than available space.
     * Number of bytes available for the app is hold in "grantedQuota" attreibute.
     *
     * Note that the app must set quota number > 0 for local FS or it will
     * cause an error during file save.
     *
     * @attribute quota
     * @type number
     * @default 0
     */
    quota: 0
  },

  /**
   * Granted by te user agent number of bytes avaibale to use by the app.
   * It will be filled up if "syncable" attribute is false and the app
   * already requested filesystem.
   *
   * @attribute grantedQuota
   * @type number
   * @default 0
   */
  grantedQuota: 0,

  /**
   * Request a syncable filesystem.
   */
  requestFilesystem: function(){

    this._requestLocalFS()
      then(function(fileSystem){
        this.fire('local-filesystem', {
          'filesystem': fileSystem,
          'grantedQuota': this.grantedQuota
        });
      }.bind(this))
      .catch(function(reason){
        this.fire('local-error', {
          'message': reason
        });
      }.bind(this));
  },

  /**
   * Request a local filesystem.
   *
   * @returns {Promise} Promise will result with DOMFileSystem object.
   */
  _requestLocalFS: function(){
    return new Promise(function(resolve, reject) {

      var onInit = function(fs) {
        resolve(fs);
      };
      var onError = function(e) {
        reject(e);
      };

      navigator.webkitPersistentStorage.requestQuota(this.quota, function(grantedBytes) {
        this.grantedQuota = grantedBytes;
        window.requestFileSystem(window.PERSISTENT, grantedBytes, onInit, onError);
      }.bind(this), onError);

    }.bind(this));
  },


  /**
   * Returns the current usage and quota in bytes for the 'syncable' file storage for the app.
   *
   * @returns {Promise} Promise will result with 'syncable' filesystem status.
   * Object will have folowwing keys:
   *  - usageBytes (integer)
   *  - quotaBytes (integer)
   */
  getUsageAndQuota: function(){
    navigator.webkitPersistentStorage.queryUsageAndQuota(
      function(currentUsageInBytes, currentQuotaInBytes) {
        this.fire('local-filesystem-usage', {
          'usageInfo': {
            'usageBytes': currentUsageInBytes,
            'quotaBytes': currentQuotaInBytes
          }
        });
      }.bind(this),
      function(e) {
        this.fire('local-error', {
          'messager': e.message
        });
      }.bind(this)
    );
  }

});