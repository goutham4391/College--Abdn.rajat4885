/**
 * Config for Civic cookie consent on abdn.ac.uk
 *
 * Note that the cookie control library should be loaded first.
 *
 * Created 14 Jul 2020
 * Updated 29 Jul 2021
 *
 * Last update: add Thor cookie, RB
 *
 * @author Allan A Beattie
 */

function moveButtons() {
    if (document.getElementById('ccc-button-holder')) {
        $('#ccc-button-holder').after('<h2 class="preference-title">My Preferences</h2>');
        $('#ccc-dismiss-button').appendTo('#ccc-button-holder');
        $('#ccc-recommended-settings').insertAfter('#ccc-dismiss-button');

        var toggles = document.querySelectorAll('.checkbox-toggle-input');
        for (var i = 0; i < toggles.length; i ++) {
            toggles[i].addEventListener('change', function(e) {
                $('#ccc-dismiss-button').insertBefore('#ccc-recommended-settings');
            });
        }
    }
}

var config = {
    apiKey: 'eab27a96ac036205227c0dd111eec7e00118dc71',
    product: 'PRO_MULTISITE',
    initialState: 'notify',
    position: 'LEFT',
    theme: 'DARK',
    acceptBehaviour: 'recommended',
    rejectButton: false,
    closeStyle: 'button',
    notifyOnce: true,
    notifyDismissButton: false,
    branding: {
        backgroundColor: '#333',
        fontFamily: '"Source Sans Pro", sans-serif',
        removeAbout: true
    },
    accessibility: {
        outline: true
    },
    onLoad: function() {
        // add CSS file
        var link = document.createElement('link');
        link.href = global_base_url + 'cookies/css/cookie-consent.css';
        link.rel = 'stylesheet';
        link.media = 'screen';

        document.getElementsByTagName('head')[0].appendChild(link);

        moveButtons();

        if (document.querySelector('button.ccc-notify-button.ccc-link.ccc-tabbable.ccc-notify-link')) {
            document.querySelector('button.ccc-notify-button.ccc-link.ccc-tabbable.ccc-notify-link').addEventListener('click', function(e) {
                moveButtons();
            });
        }

        document.getElementById('ccc-icon').addEventListener('click', function(e) {
            moveButtons();
        });
    },
    necessaryCookies: [
        'UoAInfrastructure',
        'BIGipServer*',
        'PHPSESSID',
        'abdn_web_*',
        'abdn_forms',
        'abdn_prospectus',
        'abdn_prospectus_session',
        'abdn_ap_session',
        'confidential_reporting_production_session',
        'XSRF-TOKEN',
        'csrf_madg_coursemanagement_cookie',
        'madg_coursemanagement',
        'dmSessionID',
        'recordID',
        'uoacoursecatalogue',
        'apertureSession',
        'aperture_csrf_cookie',
        'aaSSO',
        'isibs',
        'uoascef_session',
        'uoascef_csrf_cookie',
        'uoascef_session',
        'laravel_session',
        'room_booking_production_session',
        'mytimetable',
        'csrf_cookie_timetables',
        'timetablesssouser',
        'odin2odin2',
        'mycgk',
        'visitor',
    ],
    optionalCookies: [{
        name: 'functional',
        label: 'Functional Cookies',
        description: 'These are used to remember settings in relation to your use of this website. For example, whether you have seen a pop-up message so that you don\'t see it every time you visit the website. Such cookies are only used for this specific purpose, and do not contain any personal information.',
        cookies: [
            'abdn_maps',
            'abdn_show_cookie_advisory_20180525',
            '_GRECAPTCHA',
        ],
        onAccept: function () {},
        onRevoke: function () {},
        recommendedState: true
    }, {
        name: 'performance',
        label: 'Performance Cookies',
        description: 'Performance cookies enable us to collect anonymous data in Google Analytics about how people use our website. This data helps us improve the website for users.',
        cookies: [
            '_hj*',
            '__cfduid',
            '_dc_gtm_UA-209114-1',
            '_ga',
            '_gid',
            '_gat',
            '_gat_*',
            'AMP_TOKEN',
            '_gac_*',
            '_gcl_au',
            '__utma',
            '__utmt',
            '__utmb',
            '__utmc',
            '__utmz',
            '__utmv',
            '_setDomainName',
            '_setCookiePath',
            '_setVisitorCookieTimeout',
            '_setSessionCookieTimeout',
            '_setCampaignCookieTimeout',
            '_storeGac',
            '__utmx',
            '__utmxx',
            '_gaexp',
            '_opt_awcid',
            '_opt_awmid',
            '_opt_awgid',
            '_opt_awkid',
            '_opt_utmc',
            '_opt_expid',
        ],
        onAccept: function () {
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:610077,hjsv:5};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'//static.hotjar.com/c/hotjar-','.js?sv=');

            (function(w,d,s,l,i){
                w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-W7MBZZ7');
        },
        onRevoke: function () {},
        recommendedState: true,
    }, {
        name: 'social',
        label: 'Social Media Cookies',
        description: 'On some pages we embed content or feeds from e.g. Facebook, Twitter, Weibo, YouTube. These external services may place cookies on your device.',
        cookies: [
            'bcookie',
            'bscookie',
            'dmSessionID',
            'fr',
            'lang',
            'lidc',
            'lissc',
            'test_cookie',
            'LPSID-12290891',
            'LPSessionID',
            'LPVID',
            'LPVisitorID',
            'UserMatchHistory',
            'CONSENT',
            'GPS',
            'PREF',
            'ST-1u53w6n',
            'VISITOR_INFO1_LIVE',
            'YSC',
            'CGIC',
            'SNID',
            'DV',
            'ANID',
            '1P_JAR',
        ],
        onAccept: function () {},
        onRevoke: function () {},
        recommendedState: true,
        thirdPartyCookies: [{
                'name': 'Google',
                'optOutLink': 'https://policies.google.com/privacy'
            },
            {
                'name': 'Twitter',
                'optOutLink': 'https://business.twitter.com/en/help/ads-policies/other-policy-requirements/interest-based-opt-out-policy.html'
            },
            {
                'name': 'LinkedIn',
                'optOutLink': 'https://www.linkedin.com/legal/cookie-table'
            },
            {
                'name': 'Facebook',
                'optOutLink': 'https://www.facebook.com/policies/cookies/'
            }
        ]
    }, {
        name: 'marketing',
        label: 'Marketing Cookies',
        description: 'Marketing cookies are used to show you relevant adverts on other websites based on your use of this website.',
        cookies: [
            '_fbp',
        ],
        recommendedState: true,
        onAccept: function () {
            (function(w,d,s,l,i){
                w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WJ2DRK2');
        },
        onRevoke: function () {}
    }],
    text: {
        notifyTitle: 'We use cookies to give you the best possible experience',
        notifyDescription: 'If you don\'t want to accept cookies you can change preferences',
        title: 'Cookies on our website',
        intro: 'We use cookies on this website, mainly to provide a secure browsing experience but also to collect statistics on how the website is used. We also embed content from third parties, including social media websites, which may include cookies.',
        necessaryTitle: 'Strictly Necessary',
        necessaryDescription: 'Strictly necessary cookies are required for the website to work safely and properly in your browser. You can disable these cookies in your browser settings.',
        thirdPartyTitle: 'Warning: Some cookies require your attention',
        thirdPartyDescription: 'Consent for the following cookies could not be automatically revoked. Please follow the link(s) below to opt out manually.',
        acceptRecommended: 'Accept All Cookies',
        accept: 'Accept All Cookies',
        closeLabel: 'Use My Preferences'
    },
    statement: {
        description: 'You can find out more about the cookies we set, the information we store and how we use it on',
        name: 'our cookies page',
        url: 'https://www.abdn.ac.uk/about/our-website/cookies.php',
        updated: '14/06/2020'
    }
};

CookieControl.load(config);
