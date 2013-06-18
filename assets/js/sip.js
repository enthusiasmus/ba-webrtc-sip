/**
 * Asterisk Ubuntu Usernames
 *
 * WebRTCClient:mydomain.tld:mystrongpassword
 * cb48ca0391cc11b04692c2cace798b94
 *
 * LegacySIPClient:mydomain.tld:mystrongpassword
 * 324e1296443af1fe6932f00bad918b6c
 */

/**
 * SIPML5
 */

var SIP = {
  /* Attributes */
  sipStack: null,
  registerSession: null,
  callSession: null,
  messageSession: null,
  publishSession: null,
  subscribeSession: null,
  /* Functions */
  init: function(configuration) {
    SIPml.init(function(event) {
      SIP.createSipStack(configuration);
      SIP.sipStack.start();
    }, function(event) {
      console.error('Failed to initialize the engine: ' + event.message);
    });
  },
  createSipStack: function(configuration) {
    this.sipStack = new SIPml.Stack({
      realm: configuration.realm, // mandatory: domain name
      impi: configuration.impi, // mandatory: authorization name (IMS Private Identity)
      impu: configuration.impu, // mandatory: valid SIP Uri (IMS Public Identity)
      password: configuration.password, // optional
      display_name: 'Lukas W.', // optional
      websocket_proxy_url: 'ws://10.0.0.3:8088/ws', // optional
      outbound_proxy_url: 'http://10.0.0.3:5060', //'http://proxy.sipthor.net', // optional
      enable_rtcweb_breaker: true, // optional
      events_listener: {
        events: '*',
        listener: eventManager
      }/*,
       sip_headers: [// optional
       {
       name: 'User-Agent',
       value: 'IM-client/OMA1.0 sipML5-v1.0.0.0'
       }, {
       name: 'Organization',
       value: 'Doubango Telecom'
       }]*/
    });
  },
  login: function() {
    this.registerSession = this.sipStack.newSession('register', {
      events_listener: {
        events: '*',
        listener: eventManager
      }
    });
    this.registerSession.register();
  },
  logout: function() {
    this.registerSession.unregister();
  },
  makeCall: function(person, configuration) {
    this.callSession = this.sipStack.newSession(configuration.media, {
      video_local: document.getElementById('video-local'),
      video_remote: document.getElementById('video-remote'),
      audio_remote: document.getElementById('audio-remote'),
      events_listener: {
        events: '*',
        listener: eventManager
      }
    });

    this.callSession.call(person);
  },
  hangupCall: function() {
    this.callSession.hangup();
  },
  acceptCall: function(e) {
    e.newSession.accept();
    // e.newSession.reject() to reject the call
  },
  reset: function() {
    //stops sipstack and disconnect websocket
    this.sipStack.stop();
  },
  sendMessage: function(to) {
    this.messageSession = this.sipStack.newSession('message', {
      events_listener: {
        events: '*',
        listener: eventManager
      }
    });
    this.messageSession.send(to, 'Pêche à la moule', 'text/plain;charset=utf-8');
  },
  acceptMessage: function(e) {
    e.newSession.accept();
    // e.newSession.reject(); to reject the message
    console.info('SMS-content = ' + e.getContentString() + ' and SMS-content-type = ' + e.getContentType());
  },
  publishPresence: function() {
    this.publishSession = this.sipStack.newSession('publish', {
      events_listener: {
        events: '*',
        listener: eventManager
      }
    });
    var contentType = 'application/pidf+xml';
    var content = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n' + '<presence xmlns=\"urn:ietf:params:xml:ns:pidf\"\n' + ' xmlns:im=\"urn:ietf:params:xml:ns:pidf:im\"' + ' entity=\"sip:bob@example.com\">\n' + '<tuple id=\"s8794\">\n' + '<status>\n' + '   <basic>open</basic>\n' + '   <im:im>away</im:im>\n' + '</status>\n' + '<contact priority=\"0.8\">tel:+33600000000</contact>\n' + '<note  xml:lang=\"fr\">Bonjour de Paris :)</note>\n' + '</tuple>\n' + '</presence>';
    // send the PUBLISH request
    this.publishSession.publish(content, contentType, {
      expires: 200,
      sip_caps: [{
        name: '+g.oma.sip-im'
      }, {
        name: '+sip.ice'
      }, {
        name: 'language',
        value: '\"en,fr\"'
      }],
      sip_headers: [{
        name: 'Event',
        value: 'presence'
      }, {
        name: 'Organization',
        value: 'Doubango Telecom'
      }]
    });
  },
  subscribePresence: function(to) {
    this.subscribeSession = this.sipStack.newSession('subscribe', {
      expires: 200,
      events_listener: {
        events: '*',
        listener: eventManager
      },
      sip_headers: [{
        name: 'Event',
        value: 'presence'
      }, // only notify for 'presence' events
      {
        name: 'Accept',
        value: 'application/pidf+xml'
      } // supported content types (COMMA-sparated)
      ],
      sip_caps: [{
        name: '+g.oma.sip-im',
        value: null
      }, {
        name: '+audio',
        value: null
      }, {
        name: 'language',
        value: '\"en,fr\"'
      }]
    });
    // start watching for entity's presence status (You may track event type 'connected' to be sure that the request has been accepted by the server)
    this.subscribeSession.subscribe(to);
  }
};
