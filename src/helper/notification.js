const OneSignal = require('@onesignal/node-onesignal');

exports.sendPushNotification = async (playerIds, notificationData) => {

    const ONESIGNAL_APP_ID = '424d1a08-6017-4f44-b96c-cdc8b63a78b3';
    const app_key_provider = {
      getToken() {
          return 'YTQxZDUzNzktNjZjNi00Njg1LWJlMzUtOTcyNmE1MjE5NTQ1';
      }
    };
    const configuration = OneSignal.createConfiguration({
      authMethods: {
          app_key: {
            tokenProvider: app_key_provider
          }
      }
    });
    
    client = new OneSignal.DefaultApi(configuration);

    const notification = new OneSignal.Notification();
    notification.app_id = ONESIGNAL_APP_ID;
    notification.include_player_ids = playerIds;
    
    notification.headings = {
        en: notificationData.title
    };
    notification.subtitle = {
        en: notificationData.subtitle
    };
    notification.contents = {
        en: notificationData.message
    };
    notification.ios_badge_type = "Increase";
    notification.ios_badge_count = 1;
    notification.data = {
        action: notificationData.action
    }

    if (notificationData.fromId) {
        notification.data.fromID = notificationData.fromId;
    }

    const {id} = await client.createNotification(notification);
    return id;
}