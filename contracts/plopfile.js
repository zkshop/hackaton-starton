module.exports = function (plop) {
    plop.setGenerator('contract', {
        description: 'Personalized NFT Collection contract',

        // inquirer prompts
        prompts: [{
            type: 'input',
            name: 'name',
            message: 'contract name ?',
        }],

        // actions to perform
        actions: [{
            type: 'add',
            path: 'contracts/generated/{{camelCase name}}.sol',
            templateFile: 'templates/contract.sol.hbs',
        }]
    });

};