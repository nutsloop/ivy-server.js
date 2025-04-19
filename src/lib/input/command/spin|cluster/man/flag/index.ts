export const spin_cluster_acme_challenge_description = `tells the server to serve the ACME challenge files without follow multi-domain config or global redirect to https.`;
export const spin_cluster_acme_challenge_usage = 'ivy-server spin|cluster --acme-challenge';

export const spin_cluster_address_description = `Address to run the server on`;
export const spin_cluster_address_usage = 'ivy-server spin|cluster --address[-a]=localhost';

export const cluster_cpus_description = `The number of cpus to use`;
export const cluster_cpus_usage = 'ivy-server cluster --cpus=[number]';

export const spin_cluster_control_room_description = `create a socket connection to stream server data and statiistic to a client application`;
export const spin_cluster_control_room_usage = 'ivy-server spin|cluster --control-room';

export const spin_cluster_cut_user_agent_description = `cut the user agent from the log`;
export const spin_cluster_cut_user_agent_usage = 'ivy-server spin|cluster --cut-user-agent';

export const cluster_exec_description = `The path to the file to execute while clustering`;
export const cluster_exec_usage = 'ivy-server cluster --exec=[path]';

export const spin_cluster_hot_routes_description = `The server makes use of hot routes`;
export const spin_cluster_hot_routes_usage = 'ivy-server spin|cluster --hot-routes';

export const spin_cluster_https_description = `Run https protocol`;
export const spin_cluster_https_usage = 'ivy-server spin|cluster --https';

export const spin_cluster_live_reload_description = `Live reload the browser when the files change`;
export const spin_cluster_live_reload_usage = 'ivy-server spin|cluster --live-reload';

export const spin_cluster_log_description = `Log the requests`;
export const spin_cluster_log_usage = 'ivy-server spin|cluster --log';

export const spin_cluster_log_color_description = `Color the log, it depend on the flag --log to be set`;
export const spin_cluster_log_color_usage = 'ivy-server spin|cluster --log-color --log';

export const spin_cluster_log_persistent_description = `Log requests on file/db anything, useful for debugging
   it requires the flag --log to be set
   it requires a logConfig.js file in the root of your project.
   the given number to the flag it will cluster many threads to handle the requests.
`;
export const spin_cluster_log_persistent_usage = 'ivy-server spin|cluster --log --log-persistent';

export const spin_cluster_log_request_headers_description = `log the request headers it requires the flag --log to be set.`;
export const spin_cluster_log_request_headers_usage = 'ivy-server spin|cluster --log --log-request-headers';

export const spin_cluster_multi_domain_description = `serve multiple domains from a single server instance. require a config file in the root of your project named "multiDomainConfig.js". or it is possible to give the path to the file as a flag option`;
export const spin_cluster_multi_domain_usage = 'ivy-server spin|cluster --multi-domain=[path/to/domain/multiDomainConfig.js]';

export const spin_cluster_mute_client_error_description = `it mutes the client error listener by only not printing the error to the console.`;
export const spin_cluster_mute_client_error_usage = 'ivy-server spin|cluster --mute-client-error';

export const spin_cluster_port_description = `Port to run the server on`;
export const spin_cluster_port_usage = 'ivy-server spin|cluster --port[-p]=3000';

export const spin_cluster_redirect_to_description = `Redirect to a different URL (301 Moved Permanently)`;
export const spin_cluster_redirect_to_usage = 'ivy-server spin|cluster --redirect-to=https://www.domain.com';

export const spin_cluster_redirect_to_https_description = `Redirect to https, requires --redirect-to`;
export const spin_cluster_redirect_to_https_usage = 'ivy-server spin|cluster --redirect-to=https://www.domain.com --redirect-to-https';

export const spin_cluster_routes_description = `The server makes use of routes`;
export const spin_cluster_routes_usage = 'ivy-server spin|cluster --routes';

export const spin_cluster_served_by_description = `Sets the header 'served-by' to the given value`;
export const spin_cluster_served_by_usage = 'ivy-server spin|cluster --served-by=whatever';

export const spin_cluster_socket_description = `Activate socket(tls|sock)connection for the server.
To activate the socket connection, you must provide a config file in the root of your project named "socketConfig.js".
see example in the documentation.`;
export const spin_cluster_socket_usage = 'ivy-server spin --socket';

export const spin_cluster_to_index_html_description = `Redirects all the requests to the index.html file`;
export const spin_cluster_to_index_html_usage = 'ivy-server spin|cluster --to-index-html';

export const spin_cluster_virtual_routes_description = `❗️This flag depends on the flag --to-index-html
        when using solidjs, React, we need to declare the 200 response code pages as virtual routes.
          - create a directory named 'vroutes' in your project root.
          - add routes, one per line starting with '/', to a file named .virtual-routes.
          - example:
            - /home
            - /about

          It is possible to change the default directory name 'vroutes', the path must be relative to your project root.
          the path must exist and be a directory.

          the descriptor file must be named .virtual-routes

          ivy-server spin|cluster --virtual-routes='path/to/vroutes' --to-index-html
`;
export const spin_cluster_virtual_routes_usage = `ivy-server spin|cluster --virtual-routes=[void|string] --to-index-html`;

export const spin_cluster_www_root_description = `The root directory of the static files`;
export const spin_cluster_www_root_usage = 'ivy-server spin|cluster --www-root=[path]';
