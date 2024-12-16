"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const color_1 = require("@heroku-cli/color");
const core_1 = require("@oclif/core");
const time = require("../../lib/time");
const wrap = require("word-wrap");
function displayNotifications(notifications, app, readNotification) {
    const read = readNotification ? 'Read' : 'Unread';
    core_1.ux.styledHeader(app ? `${read} Notifications for ${color_1.default.app(app.name)}` : `${read} Notifications`);
    for (const n of notifications) {
        core_1.ux.log(color_1.default.yellow(`\n${n.title}\n`));
        core_1.ux.log(wrap(`\n${color_1.default.dim(time.ago(new Date(n.created_at)))}\n${n.body}`, { width: 80 }));
        for (const followup of n.followup) {
            core_1.ux.log();
            core_1.ux.log(wrap(`${color_1.default.gray.dim(time.ago(new Date(followup.created_at)))}\n${followup.body}`, { width: 80 }));
        }
    }
}
class NotificationsIndex extends command_1.Command {
    async run() {
        const { flags } = await this.parse(NotificationsIndex);
        const appResponse = flags.app && !flags.all ? await this.heroku.get(`/apps/${flags.app}`) : null;
        const app = appResponse === null || appResponse === void 0 ? void 0 : appResponse.body;
        const notificationsResponse = await this.heroku.get('/user/notifications', { hostname: 'telex.heroku.com' });
        let notifications = notificationsResponse.body;
        if (app)
            notifications = notifications.filter(n => n.target.id === app.id);
        if (!flags.read) {
            notifications = notifications.filter(n => !n.read);
            await Promise.all(notifications.map(n => this.heroku.patch(`/user/notifications/${n.id}`, { hostname: 'telex.heroku.com', body: { read: true } })));
        }
        if (flags.json) {
            core_1.ux.styledJSON(notifications);
            return;
        }
        if (notifications.length === 0) {
            if (flags.read) {
                if (app)
                    core_1.ux.log(`You have no notifications on ${color_1.default.green(app.name)}.\nRun heroku notifications --all to view notifications for all apps.`);
                else
                    core_1.ux.log('You have no notifications.');
            }
            else if (app)
                core_1.ux.log(`No unread notifications on ${color_1.default.green(app.name)}.\nRun ${color_1.default.cmd('heroku notifications --all')} to view notifications for all apps.`);
            else
                core_1.ux.log(`No unread notifications.\nRun ${color_1.default.cmd('heroku notifications --read')} to view read notifications.`);
        }
        else
            displayNotifications(notifications, app, flags.read);
    }
}
exports.default = NotificationsIndex;
NotificationsIndex.description = 'display notifications';
NotificationsIndex.topic = 'notifications';
NotificationsIndex.flags = {
    app: command_1.flags.app({ required: false }),
    remote: command_1.flags.remote(),
    all: command_1.flags.boolean({ description: 'view all notifications (not just the ones for the current app)' }),
    json: command_1.flags.boolean({ description: 'output in json format' }),
    read: command_1.flags.boolean({ description: 'show notifications already read' }),
};
