/**
* @name ClickToChat
* @version 1.1.3
* @description Click to open direct message
* @author hobbica
* @authorId 83806103388815360
* @authorLink https://github.com/hobbica98
* @website https://github.com/hobbica98/ClickToChat-BetterDiscord-Plugin
* @source https://github.com/hobbica98/ClickToChat-BetterDiscord-Plugin/blob/master/ClickToChat.plugin.js
* @updateUrl https://raw.githubusercontent.com/hobbica98/ClickToChat-BetterDiscord-Plugin/master/ClickToChat.plugin.js
*/
/*@cc_on
@if (@_jscript)

   // Offer to self-install for clueless users that try to run this directly.
   var shell = WScript.CreateObject("WScript.Shell");
   var fs = new ActiveXObject("Scripting.FileSystemObject");
   var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
   var pathSelf = WScript.ScriptFullName;
   // Put the user at ease by addressing them in the first person
   shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
   if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
       shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
   } else if (!fs.FolderExists(pathPlugins)) {
       shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
   } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
       fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
       // Show the user where to put plugins in the future
       shell.Exec("explorer " + pathPlugins);
       shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
   }
   WScript.Quit();

@else@*/

const { Webpack, Patcher, React } = BdApi;
const getConnectedUser = Webpack.getByKeys("getCurrentUser");
const openPrivateChannel = Webpack.getByKeys("openPrivateChannel");
const VoiceUsers = Webpack.getByKeys('DecoratedComponent').DecoratedComponent;

var console = {};

module.exports = class ClickToChat {
    constructor(meta) {
        this.meta = meta;
        this.BdApi = new BdApi(this.meta.name);
        console = this.BdApi.Logger;
    }

    start() {
        this.BdApi.DOM.addStyle(this.meta.name, `div[class^='voiceUser_']{width:100%;} 
            div[class^='list_'][class*='listDefault_']{padding-left:20px;}
            .click-to-chat-btn{marginRight:1px;width:32px;height:32px;}
            div[class^='list_'][class*='collapsed_'] .click-to-chat-btn{display:none;}`);
        this.patchConnectedUser();
        this.userId = getConnectedUser.getCurrentUser().id // Loading current user ID
    }

    stop() {
        Patcher.unpatchAll(this.meta.name);
        this.BdApi.DOM.removeStyle();
    }

    async patchConnectedUser() {

        Patcher.after(this.meta.name, VoiceUsers.prototype, "render", (thisObject, [props], returnValue) => {
            const user = thisObject.props.user
            if (!user || !returnValue) return returnValue

            returnValue.props.style = {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'stretch'
            }

            // Checking if patching user is current user ID
            let disabledButtonClass = ""
            let disabledStatus = false
            if (user.id === this.userId) {
                disabledButtonClass = " bd-button-disabled"
                disabledStatus = true
            }

            const chatButton = React.createElement('div', {
                className: "bd-controls bd-addon-controls"
            }, React.createElement('button', {
                onClick: () => {
                    openPrivateChannel.openPrivateChannel(user.id)
                },
                className: "click-to-chat-btn bd-button bd-button-blank bd-button-color-brand bd-button-grow" + disabledButtonClass,
                disabled: disabledStatus
            }, React.createElement('svg',
                {
                    'xmlns': "http://www.w3.org/2000/svg",
                    style: { width: '26px', color: 'var(--channels-default)' },
                    'viewBox': "0 0 512 512",
                }, React.createElement('path',
                    {
                        fill: "currentColor",
                        d: "M448 0H64C28.7 0 0 28.7 0 64v288c0 35.3 28.7 64 64 64h96v84c0 7.1 5.8 12 12 12 2.4 0 4.9-.7 7.1-2.4L304 416h144c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64zm32 352c0 17.6-14.4 32-32 32H293.3l-8.5 6.4L192 460v-76H64c-17.6 0-32-14.4-32-32V64c0-17.6 14.4-32 32-32h384c17.6 0 32 14.4 32 32v288zM128 184c-13.3 0-24 10.7-24 24s10.7 24 24 24 24-10.7 24-24-10.7-24-24-24zm128 0c-13.3 0-24 10.7-24 24s10.7 24 24 24 24-10.7 24-24-10.7-24-24-24zm128 0c-13.3 0-24 10.7-24 24s10.7 24 24 24 24-10.7 24-24-10.7-24-24-24z"
                    }, null)
            )))

            // Check if children is an array, if not, make it an array
            returnValue.props.children = Array.isArray(returnValue.props.children)
                ? returnValue.props.children
                : [returnValue.props.children];

            // Insert the chat button at the beginning of the children array
            returnValue.props.children.unshift(chatButton);
        })
    }
};
/*@end@*/
