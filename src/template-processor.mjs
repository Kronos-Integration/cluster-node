import { Service } from "@kronos-integration/service";
import { Context } from "@template-tools/template-sync";

export class TemplateProcessor extends Service {
  static get name() {
    return "template-processor";
  }

  static get endpoints() {
    return {
      ...super.endpoints,
      execute: {
        receive: "execute"
      }
    };
  }

  async execute(request, type) {
    this.info(`got ${type} request`);

    switch (type) {
      case "ping":
        return { received : type };

      case "push":
        if (request.repository) {
          if(request.ref && request.ref.includes("template-sync")) {
            this.info(`skipping ref ${request.ref}`);
            return {};
          }

          const options = {};
          const context = await Context.from(
            await this.owner.services.repositories.provider(),
            request.repository.full_name,
            options
          );

          const pullRequests = [];
          for await (const pr of context.execute()) {
            pullRequests.push(pr.identifier);
          }

          return { pullRequests };
        }

      default:
        throw new Error(`unknown request ${type}`);
    }
  }
}
