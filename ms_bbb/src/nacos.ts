import { NacosConfigClient } from 'nacos-config';
import { NacosNamingClient } from 'nacos-naming';

/**
 * Constants
 */
// Nacos 服务地址
const serverAddr = '192.168.28.28:58848';

export const startNacos = async (props) => {
  // 参数
  const {
    group = 'DEFAULT_GROUP',
    namespace = 'public',
    ip,
    port,
    serverName,
  } = props;

  /**
   * 服务中心
   */
  // 创建客户端
  const naming = new NacosNamingClient({
    logger: console,
    namespace,
    serverList: serverAddr,
  });

  // 初始化
  await naming.ready();

  // 注册服务
  await naming.registerInstance(
    serverName,
    {
      enabled: true,
      healthy: true,
      instanceId: `${ip}:${port}`,
      ip, // 微服务地址
      port,
    },
    group,
  );

  // 订阅通知
  naming.subscribe(serverName, (value) => {
    console.log('naming subscribe :>> ', value);
  });

  /**
   * 配置中心
   */
  // 创建客户端
  const config = new NacosConfigClient({
    namespace,
    serverAddr,
  });

  // 订阅通知
  config.subscribe(
    {
      dataId: serverName,
      group,
    },
    (value) => {
      console.log('config subscribe :>> ', value);
    },
  );
};
