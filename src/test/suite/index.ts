import * as path from 'path';

export function run(): Promise<void> {
    // Create the mocha test
    const { Mocha } = require('mocha');
    const { glob } = require('glob');
    
    const mocha = new Mocha({
        ui: 'tdd',
        color: true
    });

    const testsRoot = path.resolve(__dirname, '..');

    return new Promise((c, e) => {
        const pattern = path.join(testsRoot, '**/**.test.js');
        
        glob(pattern, (err: any, files: string[]) => {
            if (err) {
                return e(err);
            }

            // Add files to the test suite
            files.forEach((f: string) => mocha.addFile(f));

            try {
                // Run the mocha test
                mocha.run((failures: number) => {
                    if (failures > 0) {
                        e(new Error(`${failures} tests failed.`));
                    } else {
                        c();
                    }
                });
            } catch (err) {
                console.error(err);
                e(err);
            }
        });
    });
}
