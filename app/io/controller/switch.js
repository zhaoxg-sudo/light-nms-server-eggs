module.exports = app => {
  class Controller extends app.Controller {
    async ping() {
      let message = this.ctx.args[0]
      await this.ctx.socket.emit('ping', `Hi! I've got your ${message}`);
    }
  }
  return Controller
};

