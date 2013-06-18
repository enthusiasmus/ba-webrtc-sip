$(document).ready(function() {
  fillForm();
  addEventListeners();
});

function addEventListeners() {
  $("#registration input[name='login']").click(function() {
    SIP.login();
  });

  $("#registration input[name='logout']").click(function() {
    SIP.logout();
  });

  $("#dialogue input[name='call']").click(function() {
    $("#dialogue input[name='hangup']").removeAttr('disabled');
    $(this).attr('disabled', 'disabled');

    var person = $("#dialogue input[name='dialoguepartner']").val();
    var audioChecked = $("#dialogue .options input[name='audio']").prop('checked');
    var videoChecked = $("#dialogue .options input[name='video']").prop('checked');
    var configuration = {};

    if (audioChecked && videoChecked) {
      configuration.media = "call-audiovideo";
    } else if (audioChecked) {
      configuration.media = "call-audio";
    } else if (videoChecked) {
      configuration.media = "call-video";
    } else {
      return;
    }
    
    $("#dialogue .options input[type='checkbox']").attr("disabled", "disabled");
    SIP.makeCall(person, configuration);
  });

  $("#dialogue .options input[type='checkbox']").change(function() {
    var audioChecked = $("#dialogue .options input[name='audio']").prop('checked');
    var videoChecked = $("#dialogue .options input[name='video']").prop('checked');

    if (!audioChecked && !videoChecked) {
      $("#dialogue input[name='call']").attr('disabled', 'disabled');
    } else {
      $("#dialogue input[name='call']").removeAttr('disabled');
    }
  });

  $("#dialogue input[name='hangup']").click(function() {
    $("#dialogue input[name='call']").removeAttr('disabled');
    $("#dialogue .options input[type='checkbox']").removeAttr('disabled');
    $(this).attr('disabled', 'disabled');

    SIP.hangupCall();
  });

  $("#registration select").change(function(event) {
    var impi = event.target.value;
    $("#registration input[name='impi']").val(impi);

    //var idxBegin = $("#registration input[name='impu']").indexOf(":");
    //var indexEnd = $("#registration input[name='impu']").indexOf("@");

    var tmpImpu = $("#registration input[name='impu']").val();
    if (tmpImpu.indexOf("mmtlukas") >= 0) {
      $("#registration input[name='impu']").val(tmpImpu.replace("lukas", "bakk"));
      $("#registration input[name='dialoguepartner']").val("mmtlukas");
    } else {
      $("#registration input[name='impu']").val(tmpImpu.replace("bakk", "lukas"));
      $("#registration input[name='dialoguepartner']").val("mmtbakk");
    }

    $("#registration input[name='impi']").blur();
    $("#registration input[name='impu']").blur();
    $("#registration input[name='dialoguepartner']").blur();
    window.localStorage.setItem("profile", event.target.value);
  });

  $("#registration input, #dialogue input").blur(function(event) {
    var name = event.target.name;
    window.localStorage.setItem(name, event.target.value);
  });

  //after loading all scripts init the sip application
  setTimeout(function() {
    var realm = $("#registration input[name='realm']").val();
    var impi = $("#registration input[name='impi']").val();
    var impu = $("#registration input[name='impu']").val();
    var password = $("#registration input[name='password']").val();

    SIP.init({
      "realm": realm,
      "impi": impi,
      "impu": impu,
      "password": password
    });
  }, 1000);
}

function eventManager(event) {
  console.info(formatTime(new Date().getTime(), "HH:MM:ss:SSS") + " " + 'sip event = ' + event.type);

  if ( event instanceof SIPml.Stack.Event) {
    switch(event.type) {
      case "starting":
        break;
      case "started":
        $("#registration input[name='login']").removeAttr("disabled");
        break;
      case "stopping":
        break;
      case "stopped":
        $("input[type='button']").attr("disabled", "disabled");
        $("#registration input[name='login']").removeAttr("disabled");
        break;
      case "failed_to_start":
        break;
      case "failed_to_stop":
        break;
      case "i_new_call":
        SIP.acceptCall(event);
        break;
      case "i_new_message":
        SIP.acceptMessage(event);
        break;
      case "m_permission_requested":
        break;
      case "m_permission_accepted":
        break;
      case "m_permission_refused":
        break;
      default:
        console.log("UNKNOWN EVENT TYPE: ", event.type);
        break;
    }
  } else if ( event instanceof SIPml.Session.Event) {
    if (event.session == SIP.registerSession) {
      switch(event.type) {
        case "connecting":
          $("#registration input[name='logout']").removeAttr('disabled');
          $("#registration input[name='login']").attr('disabled', 'disabled');
          break;
        case "connected":
          $("#dialogue input[name='call']").removeAttr("disabled");
          $("#dialogue .options input[type='checkbox']").removeAttr('disabled', 'disabled');
          break;
        case "terminating":
        case "terminated":
          $("#registration input[name='login']").removeAttr('disabled');

          $("#registration input[name='logout']").attr('disabled', 'disabled');
          $("#dialogue input[name='call']").attr('disabled', 'disabled');
          $("#dialogue input[name='hangup']").attr('disabled', 'disabled');
          $("#dialogue .options input[type='checkbox']").attr('disabled', 'disabled');
          break;
        case "i_ao_request":
          break;
        case "media_added":
          break;
        case "media_removed":
          break;
        case "i_request":
          break;
        case "o_request":
          break;
        case "cancelled_request":
          break;
        case "sent_request":
          break;
        case "transport_error":
          break;
        case "global_error":
          break;
        case "message_error":
          break;
        case "webrtc_error":
          break;
        default:
          console.log("UNKNOWN EVENT TYPE: ", event.type);
          break;
      }
    } else if (event.session == SIP.callSession) {
      switch(event.type) {
        case "connecting":
          $("#dialogue .status").css("background", "#FFFF33");
          $("#dialogue .status").text("Warten...");
          break;
        case "connected":
          $("#dialogue .status").css("background", "#339900");
          $("#dialogue .status").text("Verbindung hergestellt");
          break;
        case "terminating":
        case "terminated":
          $("#dialogue .status").css("background", "#CC6699");
          $("#dialogue .status").text("Verbindung beendet");
          $("#dialogue input[name='call']").removeAttr('disabled');
          $("#dialogue input[name='hangup']").attr('disabled', 'disabled');
          break;
        case "i_ao_request":
          break;
        case "media_added":
          break;
        case "media_removed":
          break;
        case "i_request":
          break;
        case "o_request":
          break;
        case "cancelled_request":
          break;
        case "sent_request":
          break;
        case "transport_error":
          break;
        case "global_error":
          break;
        case "message_error":
          break;
        case "webrtc_error":
          break;
        case "m_early_media":
          break;
        case "m_local_hold_ok":
          break;
        case "m_local_hold_nok":
          break;
        case "m_local_resume_ok":
          break;
        case "m_local_resume_nok":
          break;
        case "m_remote_hold":
          break;
        case "m_remote_resume":
          break;
        case "m_stream_video_local_added":
          break;
        case "m_stream_video_local_removed":
          break;
        case "m_stream_video_remote_added":
          break;
        case "m_stream_video_remote_removed":
          break;
        case "m_stream_audio_local_added":
          break;
        case "m_stream_audio_local_removed":
          break;
        case "m_stream_audio_remote_added":
          break;
        case "m_stream_audio_remote_removed":
          break;
        case "i_ect_new_call":
          break;
        case "o_ect_trying":
          break;
        case "o_ect_accepted":
          break;
        case "o_ect_completed":
          break;
        case "i_ect_completed":
          break;
        case "o_ect_failed":
          break;
        case "i_ect_failed":
          break;
        case "o_ect_notify":
          break;
        case "i_ect_notify":
          break;
        case "i_ect_requested":
          break;
        default:
          console.log("UNKNOWN EVENT TYPE: ", event.type);
          break;
      }
    }
  }
}

/*
 case 'i_notify':
 console.info('NOTIFY content = ' + event.getContentString());
 console.info('NOTIFY content-type = ' + event.getContentType());

 if (event.getContentType() == 'application/pidf+xml') {
 if (window.DOMParser) {
 var parser = new DOMParser();
 var xmlDoc = parser ? parser.parseFromString(event.getContentString(), "text/xml") : null;
 var presenceNode = xmlDoc ? xmlDoc.getElementsByTagName ("presence")[0] : null;
 if (presenceNode) {
 var entityUri = presenceNode.getAttribute("entity");
 var tupleNode = presenceNode.getElementsByTagName ("tuple")[0];
 if (entityUri && tupleNode) {
 var statusNode = tupleNode.getElementsByTagName ("status")[0];
 if (statusNode) {
 var basicNode = statusNode.getElementsByTagName ("basic")[0];
 if (basicNode) {
 console.info('Presence notification: Uri = ' + entityUri + ' status = ' + basicNode.textContent);
 }
 }
 }
 }
 }
 }
 */

function fillForm() {
  var realm = window.localStorage.getItem("realm");
  var impi = window.localStorage.getItem("impi");
  var impu = window.localStorage.getItem("impu");
  var password = window.localStorage.getItem("password");
  var dialoguepartner = window.localStorage.getItem("dialoguepartner");
  var profile = window.localStorage.getItem("profile")

  $("#registration input[name='realm']").val(realm);
  $("#registration input[name='impi']").val(impi);
  $("#registration input[name='impu']").val(impu);
  $("#registration input[name='password']").val(password);
  $("#dialogue input[name='dialoguepartner']").val(dialoguepartner);
  $("#registration select option[value='" + profile + "']").prop('selected', true);
}

function formatTime(timestamp, format, difference) {
  timestamp = difference ? timestamp - 1 * 60 * 60 * 1000 : timestamp;
  var dateTime = new Date(timestamp);
  var hours = dateTime.getHours();
  var minutes = dateTime.getMinutes();
  var seconds = dateTime.getSeconds();
  var miliseconds = dateTime.getMilliseconds();

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  if (miliseconds < 10) {
    miliseconds = "000" + miliseconds;
  } else if (miliseconds < 100) {
    miliseconds = "00" + miliseconds;
  } else if (miliseconds < 1000) {
    miliseconds = "0" + miliseconds;
  }

  if (format === "HH:MM") {
    return hours + ":" + minutes;
  } else if (format === "HH:MM:ss:SSS") {
    return hours + ":" + minutes + ":" + seconds + ":" + miliseconds;
  } else if (format === "HH:MM:ss") {
    return hours + ":" + minutes + ":" + seconds;
  }
}

window.onbeforeunload = function() {
  SIP.reset();
}
