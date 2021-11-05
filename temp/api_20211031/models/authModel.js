// https://github.com/oauthjs/express-oauth-server/tree/master/examples/postgresql

/*
 * Get access token.
 */

module.exports.getAccessToken = function(bearerToken) {
    var token = {
        access_token: 1,
        client_id: 1,
        userId: 1,
        expires: ''
    };

    return {
        accessToken: token.access_token,
        client: {id: token.client_id},
        expires: token.expires,
        user: {id: token.userId}, // could be any object
    };
};

/**
 * Get client.
 */

module.exports.getClient = function *(clientId, clientSecret) {
    var oAuthClient = {
        client_id: 1,
        client_secret: 2
    };

    return {
        clientId: oAuthClient.client_id,
        clientSecret: oAuthClient.client_secret,
        grants: ['password'] // the list of OAuth2 grant types that should be allowed
    };
};

/**
 * Get refresh token.
 */

module.exports.getRefreshToken = function *(bearerToken) {
    var token = {
        access_token: 'ABC', 
        access_token_expires_on: '', 
        client_id: 1, 
        refresh_token: 'DEF', 
        refresh_token_expires_on: '', 
        user_id: 1
    };
    
    return token;
};

/*
 * Get user.
 */

module.exports.getUser = function *(username, password) {
    var user = {
        id: 1
    };
    
    return user.id;
};

/**
 * Save token.
 */

module.exports.saveAccessToken = function *(token, client, user) {
    var o = {
        id: 1
    };
    
    return o;
};