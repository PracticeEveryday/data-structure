export class AsyncQueue extends EventTarget {
    public queue = <any>[]
    public count: number;
    public isProcess =  false;
    constructor(count: number) {
        super();
        this.count = count;

    }

    waitForProcess() {
        return new Promise(resolve => {
            const checkProcess = () => {
                if (!this.isProcess) {
                    resolve(true);
                } else {
                    setTimeout(checkProcess, 100);
                }
            };

            checkProcess();
        });
    }

    async enqueue (task: Function) {
        if(this.isProcess) {
            await this.waitForProcess();
        } else {
            this.queue.push({ task });
        }

        if(this.queue.length >= this.count) {
            this.isProcess = true;
            await this.start();
            this.isProcess = false;
        }

    }

    async start() {
        try {
            if(this.queue.length > 0) {
                const test = this.queue.shift();
                const result = await test.task(2);

                console.log(result);
            }
        } catch (error) {
            console.log(error)
        }
    }
}

const asyncQueue = new AsyncQueue(5);
function asyncTask(value: number): Promise<number> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if(value === 1) {
                resolve(value);
            } else {
                reject('test')
            }
        }, 1000);
    });
}
asyncQueue.enqueue(asyncTask)
asyncQueue.start();