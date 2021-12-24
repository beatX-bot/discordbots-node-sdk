import fetch, { Headers } from "node-fetch";
import ApiError from "../utils/ApiError";
import { EventEmitter } from "events";

import {
  Snowflake,
  BotStats,
  BotInfo,
  UserInfo,
  BotsResponse,
  ShortUser,
  BotsQuery,
} from "../typings";

interface APIOptions {
  /**
   * Discord.bots.gg Token
   */
  token?: string;
}

/**
 * Top.gg API Client for Posting stats or Fetching data
 * @example
 * ```js
 * const dbots = require(`@beatx/dbots-sdk`)
 *
 * const api = new dbots.Api('Your discord.bots.gg token')
 * ```
 * @link {@link https://beatx.js.org | Library docs}
 * @link {@link https://discord.bots.gg/docs/endpoints | API Reference}
 */
export class Api extends EventEmitter {
  private options: APIOptions;
  /**
   * Create Top.gg API instance
   * @param {string} token Token or options
   * @param {object?} options API Options
   */
  constructor(token: string, options: APIOptions = {}) {
    super();
    this.options = {
      token: token,
      ...options,
    };
  }

  private async _request(
    method: string,
    path: string,
    body?: Record<string, any>
  ): Promise<any> {
    const headers = new Headers();
    if (this.options.token) headers.set("Authorization", this.options.token);
    if (method !== "GET") headers.set("Content-Type", "application/json");

    let url = `https://discord.bots.gg/api/v1${path}`;

    if (body && method === "GET") url += `?${new URLSearchParams(body)}`;

    const response = await fetch(url, {
      method,
      headers,
      body: body && method !== "GET" ? JSON.stringify(body) : undefined,
    });

    let responseBody;
    if (response.headers.get("Content-Type")?.startsWith("application/json")) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText, response);
    }

    return responseBody;
  }

  /**
   * Post bot stats to Discord.bots.gg
   * @param {Object} stats Stats object
   * @param {number} stats.serverCount Server count
   * @param {number?} stats.shardCount Shard count
   * @param {number?} stats.shardId Posting shard (useful for process sharding)
   * @returns {BotStats} Passed object
   * @example
   * ```js
   * await api.postStats({
   *   serverCount: 28199,
   *   shardCount: 1,
   *   shardId: 0,
   * })
   * ```
   */
  public async postStats(stats: BotStats, id: Snowflake): Promise<BotStats> {
    if (!stats || !stats.serverCount) throw new Error("Missing Server Count");

    /* eslint-disable camelcase */
    await this._request("POST", `/bots/${id}/stats`, {
      server_count: stats.serverCount,
      shard_id: stats.shardId,
      shard_count: stats.shardCount,
    });
    /* eslint-enable camelcase */

    return stats;
  }

  /**
   * Get a bots stats
   * @param {Snowflake} id Bot ID
   * @returns {BotStats} Stats of bot requested
   * @example
   * ```js
   * await api.getStats('461521980492087297')
   * // =>
   * {
   *   serverCount: 28199,
   *   shardCount 1,
   *   shards: []
   * }
   * ```
   */
  public async getStats(id: Snowflake): Promise<BotStats> {
    if (!id) throw new Error("ID missing");
    const result = await this._request("GET", `/bots/${id}`);
    return {
      serverCount: result.guildCount,
      shardCount: result.shardCount,
    };
  }

  /**
   * Get bot info
   * @param {Snowflake} id Bot ID
   * @returns {BotInfo} Info for bot
   * @example
   * ```js
   * await api.getBot('461521980492087297') // returns bot info
   * ```
   */
  public async getBot(id: Snowflake): Promise<BotInfo> {
    if (!id) throw new Error("ID Missing");
    return this._request("GET", `/bots/${id}`);
  }

  /**
   * Get a list of bots
   * @param {BotsQuery} query Bot Query
   * @returns {BotsResponse} Return response
   * @example
   * ```js
   * // Finding by properties
   * await api.getBots({
   *   search: {
   *     username: 'shiro',
   *     certifiedBot: true
   *     ...any other bot object properties
   *   }
   * })
   * // =>
   * {
   *   results: [
   *     {
   *       id: '461521980492087297',
   *       username: 'Shiro',
   *       discriminator: '8764',
   *       lib: 'discord.js',
   *       ...rest of bot object
   *     }
   *     ...other shiro knockoffs B)
   *   ],
   *   limit: 10,
   *   offset: 0,
   *   count: 1,
   *   total: 1
   * }
   * // Restricting fields
   * await api.getBots({
   *   fields: ['id', 'username']
   * })
   * // =>
   * {
   *   results: [
   *     {
   *       id: '461521980492087297',
   *       username: 'Shiro'
   *     },
   *     {
   *       id: '493716749342998541',
   *       username: 'Mimu'
   *     },
   *     ...
   *   ],
   *   ...
   * }
   * ```
   */
  public async getBots(query?: BotsQuery): Promise<BotsResponse> {
    if (query) {
      if (query.fields instanceof Array) query.fields = query.fields.join(", ");
      if (query.search instanceof Object) {
        query.search = Object.entries(query.search)
          .map(([key, value]) => `${key}: ${value}`)
          .join(" ");
      }
    }
    return this._request("GET", "/bots", query);
  }
}
