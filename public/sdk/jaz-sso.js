/**
 * Jaz Academy Identity Provider JavaScript SDK (jaz-sso.js)
 * https://jazacademy.id
 *
 * Lightweight, zero-dependency SDK for embedding "Login with Jaz Academy" widget
 */
(function (window, document) {
  'use strict';

  // Auto-detect IDP URL from the script tag that loaded jaz-sso.js
  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.indexOf('jaz-sso.js') !== -1) {
        return scripts[i];
      }
    }
    return null;
  })();

  var JAZ_DEFAULT_IDP = 'https://jazacademy.id';
  if (currentScript && currentScript.src) {
    try {
      JAZ_DEFAULT_IDP = new URL(currentScript.src).origin;
    } catch (e) {}
  }
  var JAZ_LOGO_SVG = '<svg width="22" height="22" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path fill-rule="evenodd" clip-rule="evenodd" d="m 16.972301,-0.09806267 0.0064,10.99222467 11.838068,4.110085 c 0.06078,0.0211 0.100507,0.07867 0.100142,0.142756 l -0.0085,1.627841 c 0,0.02824 0.0229,0.05114 0.05114,0.05114 l 4.951705,-0.0043 c 0.04099,0 0.06179,-0.0208 0.06179,-0.06179 L 33.934656,4.0546354 c -0.04625,-1.922745 -1.044575,-3.60467307 -3.402699,-4.08877807 0,0 -10.365717,-0.04848 -13.559659,-0.06392 z M 20.835227,16.7301 c -0.0091,0 -0.01704,0.0058 -0.01704,0.01491 v 4.442472 c 0,0.0091 0.0079,0.01705 0.01704,0.01705 h 3.042614 c 0.0091,0 0.01704,-0.0079 0.01704,-0.01705 V 16.74501 c 0,-0.0091 -0.0079,-0.01491 -0.01704,-0.01491 z m 8.03054,5.18821 c -0.03775,-8.1e-4 -0.05582,0.01806 -0.0554,0.0554 l 0.0064,1.791903 c 4.1e-4,0.02029 -0.0086,0.03398 -0.0277,0.04048 -3.87393,1.36937 -7.74762,2.740816 -11.620739,4.112216 l -0.234375,0.03196 -0.02131,0.02131 0.02131,0.03622 0.02344,0.01279 0.01705,0.02983 -0.0085,4.964489 -0.02131,0.666903 0.0021,0.276989 12.758523,0.0277 c 3.678752,4.8e-4 4.360907,-3.036361 4.335937,-4.747159 l 0.0277,-7.178268 -0.03622,-0.03835 z" fill="currentColor"/>' +
    '<path fill-rule="evenodd" clip-rule="evenodd" d="M 16.972301,-0.08740967 4.2265625,0.04256233 C 1.3248445,0.07216233 0.0107163,2.0628874 0.00994314,3.9821914 L 0.00142041,29.002827 C -0.00734128,32.869936 1.4389811,34.048395 4.9509943,34.01419 L 16.96804,33.96092 16.97869,33.7095 16.96591,33.014898 c 0.03101,-1.652863 -0.0024,-3.310408 0.0085,-4.964489 -2e-5,-0.01242 -0.0062,-0.02383 -0.01705,-0.02983 l -0.02344,-0.01279 c -0.0146,-0.0077 -0.01998,-0.01958 -0.01918,-0.03622 8.1e-4,-0.01621 0.007,-0.02331 0.01918,-0.02131 L 5.2045454,23.810355 c -0.019892,-0.0073 -0.028125,-0.01978 -0.027699,-0.04048 0.012171,-0.443605 0.018366,-0.888477 0.019176,-1.331676 0.00487,-2.40553 0.00862,-4.815452 0.010653,-7.231534 0,-0.07143 0.032769,-0.118816 0.1001421,-0.142756 L 16.978693,10.894162 Z m -6.779829,16.83029367 -0.01918,0.01918 -0.0064,4.427557 3.09375,-0.01065 c 0.01006,0 0.01918,-0.007 0.01918,-0.01705 l 0.01918,-4.399858 c 0,-0.01006 -0.0091,-0.01918 -0.01918,-0.01918 z" fill="currentColor"/>' +
    '</svg>';

  // Style injector
  function injectStyles() {
    if (document.getElementById('jaz-sso-styles')) return;
    var css = `
      .jaz-btn-base {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-weight: 600;
        cursor: pointer;
        user-select: none;
        box-sizing: border-box;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        text-decoration: none;
        outline: none;
        line-height: 1.2;
      }
      .jaz-btn-base svg {
        flex-shrink: 0;
        transition: transform 0.2s ease;
      }
      .jaz-btn-base:hover svg {
        transform: scale(1.08);
      }
      /* Sizes */
      .jaz-btn-sm {
        padding: 6px 14px;
        font-size: 13px;
        border-radius: 8px;
        min-height: 32px;
      }
      .jaz-btn-md {
        padding: 10px 20px;
        font-size: 14px;
        border-radius: 10px;
        min-height: 42px;
      }
      .jaz-btn-lg {
        padding: 14px 28px;
        font-size: 15px;
        border-radius: 12px;
        min-height: 48px;
      }
      /* Shapes */
      .jaz-shape-pill {
        border-radius: 9999px !important;
      }
      .jaz-shape-square {
        border-radius: 4px !important;
      }
      /* Themes */
      .jaz-theme-filled {
        background-color: #7367F0;
        color: #ffffff !important;
        border: 1px solid #7367F0;
        box-shadow: 0 3px 12px rgba(115, 103, 240, 0.35);
      }
      .jaz-theme-filled:hover {
        background-color: #6355ee;
        border-color: #6355ee;
        box-shadow: 0 5px 16px rgba(115, 103, 240, 0.45);
        transform: translateY(-1px);
      }
      .jaz-theme-filled:active {
        transform: translateY(1px);
        box-shadow: 0 2px 6px rgba(115, 103, 240, 0.3);
      }
      .jaz-theme-outline {
        background-color: #ffffff;
        color: #7367F0 !important;
        border: 1.5px solid #7367F0;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      }
      .jaz-theme-outline:hover {
        background-color: rgba(115, 103, 240, 0.06);
        transform: translateY(-1px);
      }
      .jaz-theme-dark {
        background-color: #2F2B3D;
        color: #FFFFFF !important;
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
      }
      .jaz-theme-dark:hover {
        background-color: #3b364c;
        border-color: #7367F0;
        transform: translateY(-1px);
      }
    `;
    var style = document.createElement('style');
    style.id = 'jaz-sso-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  var config = {
    client_id: '',
    redirect_uri: '',
    idp_url: JAZ_DEFAULT_IDP,
    scope: 'profile email',
    ux_mode: 'popup', // 'popup' or 'redirect'
    callback: null,
  };

  var JazId = {
    initialize: function (userConfig) {
      if (!userConfig || !userConfig.client_id) {
        console.error('[JazId] client_id is required');
        return;
      }
      config.client_id = userConfig.client_id;
      config.idp_url = userConfig.idp_url || JAZ_DEFAULT_IDP;
      config.ux_mode = userConfig.ux_mode || 'popup';
      config.scope = userConfig.scope || 'profile email';
      config.callback = userConfig.callback || null;

      if (userConfig.redirect_uri) {
        config.redirect_uri = userConfig.redirect_uri;
      } else if (config.ux_mode === 'popup') {
        config.redirect_uri = config.idp_url.replace(/\/$/, '') + '/oauth/popup-callback';
      } else {
        config.redirect_uri = window.location.href.split('#')[0];
      }

      injectStyles();
    },

    signIn: function (options) {
      var opt = options || {};
      var clientId = opt.client_id || config.client_id;
      var idpUrl = opt.idp_url || config.idp_url || JAZ_DEFAULT_IDP;
      var uxMode = opt.ux_mode || config.ux_mode;
      var redirectUri = opt.redirect_uri || config.redirect_uri;
      var scope = opt.scope || config.scope;
      var callback = opt.callback || config.callback;

      var authUrl = opt.auth_url;
      if (!authUrl) {
        if (!clientId) {
          console.error('[JazId] Cannot sign in: client_id is missing.');
          return;
        }

        if (!redirectUri) {
          if (uxMode === 'popup') {
            redirectUri = idpUrl.replace(/\/$/, '') + '/oauth/popup-callback';
          } else {
            redirectUri = window.location.href.split('#')[0];
          }
        }

        var state = 'jaz_' + Math.random().toString(36).substring(2, 15);
        authUrl = idpUrl.replace(/\/$/, '') + (opt.endpoint || '/oauth/authorize') +
          '?client_id=' + encodeURIComponent(clientId) +
          '&redirect_uri=' + encodeURIComponent(redirectUri) +
          '&response_type=code' +
          '&scope=' + encodeURIComponent(scope) +
          '&state=' + encodeURIComponent(state);
      }

      if (uxMode === 'redirect') {
        window.location.href = authUrl;
        return;
      }

      // Popup Mode
      var width = 500;
      var height = 650;
      var left = (window.screen.width - width) / 2;
      var top = (window.screen.height - height) / 2;
      var popup = window.open(
        authUrl + (authUrl.indexOf('?') === -1 ? '?' : '&') + 'display=popup',
        'JazAcademyAuthPopup',
        'width=' + width + ',height=' + height + ',top=' + top + ',left=' + left + ',toolbar=no,menubar=no,status=no,resizable=yes'
      );

      if (!popup) {
        console.warn('[JazId] Popup blocked by browser. Falling back to redirect.');
        window.location.href = authUrl;
        return;
      }

      var messageHandler = function (event) {
        try {
          var allowedOrigin = new URL(idpUrl).origin;
          if (event.origin !== allowedOrigin) {
            // Also allow localhost <-> 127.0.0.1 on the same port
            var eUrl = new URL(event.origin);
            var aUrl = new URL(allowedOrigin);
            var isLocalMatch = (eUrl.port === aUrl.port) &&
              (eUrl.hostname === 'localhost' || eUrl.hostname === '127.0.0.1') &&
              (aUrl.hostname === 'localhost' || aUrl.hostname === '127.0.0.1');
            if (!isLocalMatch) return;
          }
        } catch(e) {}

        if (event.data && (event.data.type === 'JAZ_SSO_AUTH_SUCCESS' || event.data.type === 'JAZ_AUTH_SUCCESS' || event.data.code)) {
          window.removeEventListener('message', messageHandler);
          if (popup && !popup.closed) popup.close();

          if (typeof callback === 'function') {
            callback(event.data);
          } else if (typeof window[callback] === 'function') {
            window[callback](event.data);
          }
        } else if (event.data && (event.data.type === 'JAZ_SSO_AUTH_ERROR' || event.data.type === 'JAZ_AUTH_ERROR' || event.data.error)) {
          window.removeEventListener('message', messageHandler);
          if (popup && !popup.closed) popup.close();

          if (typeof callback === 'function') {
            callback(event.data);
          } else if (typeof window[callback] === 'function') {
            window[callback](event.data);
          }
        }
      };

      window.addEventListener('message', messageHandler);
    },

    renderButton: function (container, options) {
      if (!container) return;
      injectStyles();

      var opt = options || {};
      var theme = opt.theme || 'filled'; // 'filled', 'outline', 'dark'
      var size = opt.size || 'md';       // 'sm', 'md', 'lg'
      var shape = opt.shape || 'rounded';// 'rounded', 'pill', 'square'
      var text = opt.text || 'Login via Jaz Academy';
      var customClass = opt.className ? ' ' + opt.className : '';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'jaz-btn-base jaz-btn-' + size + ' jaz-theme-' + theme + ' jaz-shape-' + shape + customClass;
      btn.innerHTML = JAZ_LOGO_SVG + '<span>' + text + '</span>';

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        JazId.signIn(opt);
      });

      container.innerHTML = '';
      container.appendChild(btn);
    },

    autoRender: function () {
      var elements = document.querySelectorAll('[data-jaz-sso], #jaz-sso-btn, .jaz-sso-button');
      elements.forEach(function (el) {
        var clientId = el.getAttribute('data-client_id');
        var idpUrl = el.getAttribute('data-idp_url');
        var theme = el.getAttribute('data-theme') || 'filled';
        var size = el.getAttribute('data-size') || 'md';
        var shape = el.getAttribute('data-shape') || 'rounded';
        var text = el.getAttribute('data-text') || 'Login via Jaz Academy';
        var callbackName = el.getAttribute('data-callback');
        var uxMode = el.getAttribute('data-ux_mode') || 'popup';
        var redirectUri = el.getAttribute('data-redirect_uri');

        if (clientId) {
          JazId.initialize({
            client_id: clientId,
            idp_url: idpUrl,
            redirect_uri: redirectUri,
            ux_mode: uxMode,
            callback: callbackName
          });
        }

        JazId.renderButton(el, {
          theme: theme,
          size: size,
          shape: shape,
          text: text,
          callback: callbackName,
          client_id: clientId,
          idp_url: idpUrl,
          ux_mode: uxMode,
          redirect_uri: redirectUri
        });
      });
    }
  };

  // Expose global object
  window.JazId = JazId;

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', JazId.autoRender);
  } else {
    JazId.autoRender();
  }

})(window, document);
