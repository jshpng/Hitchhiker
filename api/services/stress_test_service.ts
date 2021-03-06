import * as WS from 'ws';
import { ScheduleService } from './schedule_service';
import { ScheduleRunner } from '../run_engine/schedule_runner';
import { WebSocketHandler } from './base/web_socket_handler';
import { Log } from '../utils/log';
import { StressMessageType, StressRequest } from '../interfaces/dto_stress_setting';
import { ChildProcessManager } from '../run_engine/child_process_manager';
import { StringUtil } from '../utils/string_util';

export class StressTestService extends WebSocketHandler {

    private id: string;

    constructor() {
        super();
        this.id = StringUtil.generateShortId();
    }

    init() {
        ChildProcessManager.instance.initStressUser(this.id, this.socket);
    }

    onReceive(data: string) {
        Log.info(`Stress Test - receive data: ${data}`);
        let info;
        try {
            info = JSON.parse(data);
        } catch (e) {
            Log.error(e);
            return;
        }

        this.pass(info);
    }

    onClose() {
        Log.info('Stress Test - client close');

        this.close();
    }

    async pass(info: StressRequest): Promise<any> {
        if (!info) {
            this.close('Stress Test - invalid info');
            return;
        }

        if (info.type === StressMessageType.task) {
            ChildProcessManager.instance.sendStressTask(this.id, this.socket, info.setting);
        } else if (info.type === StressMessageType.stop) {
            ChildProcessManager.instance.stopStressTask(this.id);
        }
    }
}