import { monolithOfUrl, MonolithOptions } from 'monolith';

monolithOfUrl(location.href, MonolithOptions.new())
    .then(console.log)
    .catch(console.error);
