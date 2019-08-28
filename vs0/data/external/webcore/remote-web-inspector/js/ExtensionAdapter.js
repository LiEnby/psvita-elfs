/*
 * Copyright (C) 2013 Sony Corporation  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY SONY CORPORATION "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


var ExtensionAdapter = (function (){

    var Paths = {
        appBaseUrl: "external/inspector/front-end/",
        appBaseToExtensionBaseUrl : "../../../src/extension/",
        extensionBaseUrl: ""
    }

    var ExtensionDescriptor = function(startPage, name){
        this.startPage = Path.join(Path.dirname(window.location.href), Paths.appBaseToExtensionBaseUrl + startPage);
        this.name = name;

        if(this.startPage.indexOf('file:/') !== -1){
            var strings = this.startPage.split('file:/');
            this.startPage = 'file:///' + strings[1];
        }

        Paths.extensionBaseUrl = getExtensionBaseUrl(this.startPage);
    }

    var getExtensionBaseUrl = function(path){
        var urlOriginRegExp = new RegExp("([^:]+:\/\/[^/]*)\/");
        var origin = urlOriginRegExp.exec(path);
        var dirname = Path.dirname(path);
        var paths = dirname.split(origin[0]);
        return paths[1] + "/";
    }

    var addExtension = function(extension){
        ExtensionAdapter.addFunctionalityforStub();
        window.addExtension(extension.startPage, extension.name);
        buildExtensionAPIInjectedScript(extension);
        window.removeEventListener("DOMContentLoaded", ExtensionAdapter.addExtension, false);
    }

    var addExtensions = function(extensions){
        ExtensionAdapter.addFunctionalityforStub();
        WebInspector.addExtensions(extensions);
        buildExtensionAPIInjectedScript(extensions[0]);
        window.removeEventListener("DOMContentLoaded", ExtensionAdapter.addExtension, false);
    }

    var Impl = {
        setInjectedScriptForOrigin : function(origin, script){
            var program = (new Function("return " + script))();
            program();
        },

        buildPlatformExtensionAPI : function(extensionInfo){

        }
    }

    return {
        getAppBaseToExtensionBaseUrl: function(){
            return Paths.appBaseToExtensionBaseUrl;
        },

        getExtensionBaseUrl: function(path){
            return getExtensionBaseUrl(path);
        },

        addExtension: function(extension){
            return addExtension(extension);
        },

        addExtensions: function(extensions){
            return addExtensions(extensions);
        },

        createExtensionDescriptor : function(startPage, name){
            return new ExtensionDescriptor(startPage, name);
        },

        addFunctionalityforStub : function(){
            InspectorFrontendHost.setInjectedScriptForOrigin = Impl.setInjectedScriptForOrigin;
//            buildPlatformExtensionAPI = Impl.buildPlatformExtensionAPI;
        }
    }
})();


function addWebInspectorExtension(){
    var extensions = [];
    ExtensionAdapter.addExtensions(extensions);
}
// window.addEventListener("DOMContentLoaded", addWebInspectorExtension, false);

