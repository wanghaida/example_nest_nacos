import { Controller, Get, Req } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { NacosNamingClient } from 'nacos-naming';
import { AppService } from './app.service';

@Controller()
export class AppController {
  // 客户端
  naming;

  // 服务列表
  serviceList = {
    count: 0,
    data: [],
    map: {},
  };

  constructor(private readonly appService: AppService) {
    // 创建客户端
    this.naming = new NacosNamingClient({
      logger: console,
      namespace: 'public',
      serverList: '192.168.28.28:58848',
    });

    // 查询服务列表
    this.naming._serverProxy
      .getServiceList(1, 20, 'DEFAULT_GROUP')
      .then((service) => {
        this.serviceList.count = service.count;
        this.serviceList.data = service.data;

        service.data.forEach((serviceName) => {
          // 获取 serviceName 服务下 所有 实例列表
          this.naming.getAllInstances(serviceName).then((instance) => {
            console.log('getAllInstances :>> ', instance);
          });

          // 获取 serviceName 服务下 可用 实例列表
          this.naming.selectInstances(serviceName).then((instance) => {
            console.log('selectInstances :>> ', instance);

            this.serviceList.map[serviceName] = instance;
          });

          // 监听 serviceName 服务下实例变化
          this.naming.subscribe(serviceName, (hosts) => {
            console.log('subscribe :>> ', hosts);

            // 获取 serviceName 服务下 可用 实例列表
            this.naming.selectInstances(serviceName).then((instance) => {
              this.serviceList.map[serviceName] = instance;
            });
          });
        });
      });
  }

  @Get('*')
  get(@Req() req): any {
    const serviceName = req.url.startsWith('/aaa') ? 'ms_aaa' : 'ms_bbb';

    // 我这里做演示，每次都动态创建服务，应该做缓存
    const microservice = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: this.serviceList.map[serviceName][0].ip,
        port: this.serviceList.map[serviceName][0].port,
      },
    });

    return microservice.send('hello', '123123');
  }
}
