/*!
 * Copyright (C) 2012-2013 Sony Corporation
 * SONY CONFIDENTIAL MATERIAL. DO NOT DISTRIBUTE.
 * All Rights Reserved
 */

var RemoteWebInspector = (function (){

    var targetURL = {
        protocol: '',
        http: 'http://',
        ws: '?ws=',
        url: '',
        ip: '',
        port: '',
        devtoolsPage: 'devtools/page/'
    }

    var config = {
        isPlatform: true
    }

    var path = {
        rootDirectory: 'remote-web-inspector',
        inspectorHtml: 'external/inspector/front-end/inspector.html',
        jsDirectory: 'js'
    }

    var formData = [
        {'name': 'Target IP address', 'placeholder': 'Target IP address', 'inputId': 'target-ip-input'},
        {'name': 'Port', 'placeholder': 'Port', 'inputId': 'port-input'},
        {'name': 'Tab', 'placeholder': 'Tab', 'inputId': 'tab-input'},
        {'name': 'Frontend(option)', 'placeholder': 'Frontend URL', 'inputId': 'frontend-input'}
    ]

    var InputForms = {
        _targetPanel: null,
        form: null,

        init: function() {
            config.isPlatform = false;
            this._targetPanel = document.getElementById('main-panel');
            this._createForm();
            return this;
        },

        show: function() {
            if(this.form) {
                this._targetPanel.appendChild(this.form);
                this._setValue();
            }
        },

        hide: function() {
            while(this._targetPanel.firstChild){
                this._targetPanel.removeChild(this._targetPanel.firstChild);
            }
        },

        showErrorMessage: function(text) {
            this.errorMsg.innerText = text || 'error';
        },

        _createForm: function() {
            this.form = document.createElement('form');
            this.table = document.createElement('table');
            this.tbody = document.createElement('tbody');

            this.table.id = 'main-table';
            this.tbody.id = 'main-tbody';

            this.table.appendChild(this.tbody);
            this.form.appendChild(this.table);

            for(var i = 0; i < formData.length; ++i){
                this.tbody.appendChild(this._createFormItem(formData[i]));
            }
            var self = this;
            var connectBtn = this._createConnectButton();
            connectBtn.addEventListener('click', function(){
                self._connectToRemoteHost();
            });
            this.tbody.appendChild(connectBtn);
        },

        _setValue: function() {
            var targetIP = document.getElementById('target-ip-input');
            var port = document.getElementById('port-input');
            var frontend = document.getElementById('frontend-input');

            targetIP.value = localStorage.getItem('targetIP') || '192.168.x.x' ;
            port.value = localStorage.getItem('port') || '12345';
            frontend.value = localStorage.getItem('frontend') || '';
        },


        _createFormItem: function(data) {
            var tr = document.createElement('tr');
            var nameTd = document.createElement('td');
            var contentTd = document.createElement('td');
            var input = document.createElement('input');
            nameTd.className = 'table-name';
            contentTd.className = 'table-content';
            nameTd.innerText = data.name;
            input.type = 'text';
            input.className = 'table-input';
            input.id = data.inputId;
            input.placeholder = data.placeholder;
            contentTd.appendChild(input);
            tr.appendChild(nameTd);
            tr.appendChild(contentTd);
            return tr;
        },

        _createConnectButton: function() {
            var tr = document.createElement('tr');
            var nameTd = document.createElement('td');
            var contentTd = document.createElement('td');
            var a = document.createElement('a');
            this.errorMsg = document.createElement('div');
            this.errorMsg.id = 'error-message';

            contentTd.className = 'table-content';
            a.className = 'btn btn-primary pull-right';
            a.id = 'connect-button';
            a.type = 'submit';
            a.innerText = 'Connect';
            contentTd.appendChild(a);

            contentTd.appendChild(this.errorMsg);
            tr.appendChild(nameTd);
            tr.appendChild(contentTd);
            return tr;
        },

        _connectToRemoteHost: function() {
            targetURL.ip = document.getElementById('target-ip-input').value;
            targetURL.port = document.getElementById('port-input').value;
            var pageNum = document.getElementById('tab-input').value;
            var frontend = document.getElementById('frontend-input').value;
            var connectBtn = document.getElementById('connect-button');

            // set input info
            window.localStorage.clear();
            window.localStorage.setItem('targetIP', targetURL.ip);
            window.localStorage.setItem('port', targetURL.port);
            window.localStorage.setItem('frontend', frontend);

            if (!pageNum) {
                getTabInfo('http://' + targetURL.ip + ':' + targetURL.port, this._onReady);
                return;
            }

            if (frontend) {
                connectBtn.href = targetURL.http + frontend + targetURL.ws + targetURL.ip + ':' + targetURL.port + '/' + targetURL.devtoolsPage + pageNum;
            }
            else {
                var scriptPath = checkScriptPath();
                var frontendPath = scriptPath + path.inspectorHtml;
                connectBtn.href = frontendPath + targetURL.ws + targetURL.ip + ':' + targetURL.port + '/' + targetURL.devtoolsPage + pageNum;
            }
        },

        _onReady: function() {
            if (this.readyState === 4 && this.status === 200) {
                if (this.response !== null) {
                    var responseJSON = JSON.parse(this.response);
                    InputForms.hide();
                    TabList.init(responseJSON).show();
                }
            }
            if (this.readyState === 4 && this.status === 0) {
                InputForms.showErrorMessage('Please confirm IP address or port');
            }
        }
    }

    var TabList = {

        _targetPanel: null,

        init: function(jsonObj) {
            this._targetPanel = document.getElementById('main-panel')
            this._tabInfo = jsonObj;
            this._sort();
            return this;
        },

        show: function() {
            var section = null;
            var curPid = 0;
            for(var i = 0; i < this._tabInfo.length; ++i) {
                if (this._tabInfo[i].processID != curPid) {
                    curPid = this._tabInfo[i].processID;

                    section = this._createSection(this._tabInfo[i]);
                    this._targetPanel.appendChild(section);
                }
                section.appendChild(this._createItem(this._tabInfo[i]));
            }
            if (!config.isPlatform) {
                var self = this;
                var backBtn = document.createElement('div');
                backBtn.className = 'btn btn-primary';
                backBtn.innerText = 'back';
                backBtn.addEventListener('click', function(){
                    self.hide();
                    InputForms.init().show();
                });
                this._targetPanel.appendChild(backBtn);
            }
        },

        hide: function() {
            while(this._targetPanel.firstChild){
                this._targetPanel.removeChild(this._targetPanel.firstChild);
            }
        },

        _sort : function() {
            this._tabInfo.sort(function(a, b){
                var pageIdA = a.id;
                var pageIdB = b.id;
                if(pageIdA < pageIdB) return -1;
                if(pageIdA > pageIdB) return 1;
                return 0;
            });
        },

        _createSection: function(obj) {
            var sectionHeader = document.createElement('h2');
            sectionHeader.className = 'process-section-header';
            sectionHeader.innerText = obj.processDisplayName;

            var sectionElem = document.createElement('div');
            sectionElem.className = 'process-section';
            sectionElem.appendChild(sectionHeader);

            return sectionElem;
        },

        _createItem: function(obj) {
            var pageID = obj.id;
            var pageTitle = obj.title || "[NO TITLE]";
            var pageUrl = obj.url || "[NO URL]";
            var wsUrl = obj.webSocketDebuggerUrl.replace(/^ws+:\/\//, "")

            var frontendRef = document.createElement('a');
            frontendRef.href = checkScriptPath() + path.inspectorHtml + targetURL.ws + wsUrl

            var title = document.createElement('h3');
            title.className = 'process-section-item-title';
            title.innerText = pageTitle;

            var url = document.createElement('p');
            url.className = 'process-section-item-url';
            url.innerText = pageUrl;


            var itemElem = document.createElement('div');
            itemElem.className = 'process-section-item';
            itemElem.appendChild(frontendRef);
            frontendRef.appendChild(title);
            frontendRef.appendChild(url);

            return itemElem;
        }

    }

    function getTabInfo(url, callback) {
        var tabListRequest = new XMLHttpRequest();
        var targetUrl = url + '/json';
        tabListRequest.open('open', targetUrl, true);
        tabListRequest.onreadystatechange = callback || onReady;
        tabListRequest.send();
    }

    function onReady() {
        if(this.readyState === 4 && this.status === 200){
            if(this.response !== null){
                var responseJSON = JSON.parse(this.response);
                TabList.init(responseJSON).show();
            }
        }
        if(this.readyState === 4 && this.status === 0){
            InputForms.init().show();
        }
    }

    function checkScriptPath(){
        var jsPath = 'js';
        var scriptName = 'RemoteWebInspector.js';
        var scriptPath;
        var re = new RegExp('(.+)' + scriptName + '$', 'i');
        var scripts = document.getElementsByTagName('script');
        var i = scripts.length;
        while (i--) {
            var m = scripts[i].src.match(re);
            if (m) {
                scriptPath = m[1];
                scriptPath = scriptPath.replace(/\/$/, '');
                break;
            }
        }

        jsPath = jsPath.replace(/\/$/, '');
        var re = new RegExp(jsPath + '$', 'i');
        var documentRoot = scriptPath.replace(re, '');

        return documentRoot;
    }

    return {
        init: function(){
            var url = window.location.href;
            var urlObj = url.split('http://');

            if(urlObj.length > 1){
                targetURL.url = urlObj[1];
                var urlObj2 = urlObj[1].split(':');

                if(urlObj2.length > 1){
                    targetURL.ip = urlObj2[0];
                    var portStr = urlObj2[1];
                    if(portStr.indexOf('/') != -1){
                        var portObj = portStr.split('/');
                        targetURL.port = portObj[0];
                    }else{
                        targetURL.port = portStr;
                    }
                }
            }

            if(window.location.protocol !== 'http:'){
                // From local file
                InputForms.init().show();
            }else{
                // From devkit or frontend server
                getTabInfo(targetURL.http + targetURL.ip + ':' + targetURL.port);
            }
        }
    };
})();


window.onload = function(){
    RemoteWebInspector.init();
}