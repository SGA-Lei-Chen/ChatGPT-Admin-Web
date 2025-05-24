/**
 * Redis 缓存键管理类
 * 用于生成带有租户 ID 前缀的缓存键，确保多租户数据隔离
 * 提供用户、会话、订单、配置等相关缓存键的生成方法
 */
class CacheKey {
  constructor(private readonly tenantId: string) {}

  get tenantPrefix() {
    return `tenant_${this.tenantId}:`;
  }
  get(key: string) {
    return `${this.tenantPrefix}${key}`;
  }
  auth(key: string) {
    return this.get(`auth:${key}`);
  }
  /**
   * @RedisForSub 消息订阅
   */
  channelOrderStatus(orderId: number) {
    return this.get(`channel:order:status:${orderId}`);
  }

}

export default CacheKey;
