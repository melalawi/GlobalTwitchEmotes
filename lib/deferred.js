var Deferred = (function(){

"use strict";

var masterDeferrals = [];

function Deferred() {
    var currentState = 'pending',
        parent,
        successCallback,
        failureCallback;

    this.setParent = function(newParent) {
        parent = newParent;

        if (currentState === 'resolved') {
            parent.check();
        }
    };

    this.then = function(callback) {
        successCallback = callback;
    };

    this.fail = function(callback) {
        failureCallback = callback;
    };

    this.resolve = function(value) {
        if (currentState === 'pending') {
            currentState = 'resolved';

            if (parent) { parent.check(); }

            if (typeof successCallback === 'function') { successCallback(value); }
        }
    };

    this.revoke = function(value) {
        if (currentState === 'pending' && typeof failureCallback === 'function') {
            currentState = 'revoked';
            failureCallback(value);
        }
    };

    this.state = function() {
        return currentState;
    };
}

function MasterDeferral(onSuccess) {
    var self = this,
        deferredArray,
        successCallback = onSuccess,
        currentState = 'pending';

    this.initialize = function(array) {
        deferredArray = array;

        for (var index = 0; index < deferredArray.length; ++index) {
            deferredArray[index].setParent(self);
        }

        self.check();
    };

    this.check = function() {
        if (currentState === 'pending') {
            var completed = true;

            for (var index = 0; index < deferredArray.length; ++index) {
                if (deferredArray[index].state() !== 'resolved') {
                    completed = false;
                    break;
                }
            }

            if (completed === true) {
                currentState === 'resolved';
                successCallback();
            }
        }
    };

    this.state = function() {
        return currentState;
    };
}

function when(deferredArray, successCallback) {
    var masterDeferral = new MasterDeferral(function(){
        masterDeferrals.splice(masterDeferrals.indexOf(masterDeferral), 1);

        successCallback();
    });

    masterDeferrals.push(masterDeferral);

    masterDeferral.initialize(deferredArray);
}

if (typeof exports === 'object') {
    exports.Deferred = Deferred;
    exports.when = when;
}

return {
    Deferred: Deferred,
    when: when
};

}());