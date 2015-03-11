/**
 * Listens for the app launching then creates the window.
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function(launchData) {

  var createOptions = {
    id: 'ChromeDemoWindow',
    innerBounds: {width: 800, height: 600},
    frame: {
      type: 'chrome',
      color: '#c00'
    }
  };

  chrome.app.window.create(
    'demo-app/index.html', createOptions, function(createdWindow){
      window.ChromeDemoWindow = createdWindow;
    }
  );
});
