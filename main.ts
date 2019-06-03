import axios from "axios";
import open from "open";
import commandLineArgs from "command-line-args";
import fs from "fs";
import readline from "readline";
import os from 'os'
import commandLineUsage from 'command-line-usage'
import shell from 'shelljs'



function getTokenFromUser(): Promise<string> {
    return new Promise(resolve => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question("Gimme Token: ", token => {
            resolve(token)
        })
    })
}

function commandLineInit(): any {
    const sections = [
        {
          header: 'A typical app',
          content: 'Generates something {italic very} important.'
        },
        {
          header: 'Options',
          optionList: [
            {
              name: 'input',
              typeLabel: 'string',
              description: 'The input to process.'
            },
            {
              name: 'help',
              description: 'Print this usage guide.'
            }
          ]
        }
      ]
      
      const usage = commandLineUsage(sections)
      // console.log(usage);
      const optionDefinitions = [
        { name: 'name', type: String, defaultOption: true },
        { name: "private", alias: "p", type: Boolean, defaultOption: false },
        { name: "description", alias: "d", type: String},
        { name: "auto_init", alias: "a", type: Boolean},
        { name: "gitignore_template", alias: "t", type: String, defaultOption: "TypeScript"},
        { name: "license", alias: "l", type: String, defaultOption: "mit" }
    ];

    const options = commandLineArgs(optionDefinitions);
    return options
}

async function getUserToken(): Promise<string> {
    let token: string;
    if (fs.existsSync(__dirname + "/token.txt")) {
        let contents = fs.readFileSync(__dirname + "/token.txt");
        token = contents.toString();
    } else {
        // Request a token addition
        
        token = await getTokenFromUser()
        fs.writeFileSync(__dirname + '/token.txt', token)
    }
    return token
}

async function createRepo(options: any, token: string) {
    return axios({
        method: "POST",
        url: "https://api.github.com/user/repos",
        headers: {
            Authorization: `token ${token}`
        },
        data: options
    })
}

async function main() {
    // Check if file exists
    let options = commandLineInit()
    let token = await getUserToken()
    try {
        let repo = (await createRepo(options, token)).data
        shell.cd(repo.name)
        shell.exec(`git clone ${repo.html_url}`)
        shell.exec('code .')
        process.exit(0)
    } catch (e) {
        console.log(e.response.data.message);
        process.exit(1)
    }
}


main().then(e => e)
