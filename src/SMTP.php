<?php
/**
 * PHPMailer RFC821 SMTP email transport class.
 *
 * @author    Chris Ryan <chris@greatbridge.com>
 * @author    Marcus Bointon <phpmailer@synchromedia.co.uk>
 * @copyright 2001 - 2020, Chris Ryan
 * @see       https://github.com/PHPMailer/PHPMailer/
 * @license   http://www.gnu.org/copyleft/lesser.html GNU Lesser General Public License
 * @note      This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 */

namespace PHPMailer\PHPMailer;

/**
 * PHPMailer RFC821 SMTP email transport class.
 * Implements RFC 821 SMTP commands and provides some utility methods for sending mail to an SMTP server.
 */
class SMTP
{
    /**
     * The PHPMailer SMTP version number.
     *
     * @var string
     */
    const VERSION = '6.1.6';

    /**
     * The EOL sequence for SMTP transactions.
     *
     * @var string
     */
    const EOL = "\r\n";

    /**
     * The SMTP port to use if one is not specified.
     *
     * @var int
     */
    const DEFAULT_PORT = 25;

    /**
     * The maximum line length allowed by RFC 2822 section 2.1.1.
     *
     * @var int
     */
    const MAX_LINE_LENGTH = 998;

    /**
     * The SMTP debug level.
     *
     * @see PHPMailer::$SMTPDebug
     *
     * @var int
     */
    public $do_debug = self::DEBUG_OFF;

    /**
     * How to handle debug output.
     *
     * @see PHPMailer::$Debugoutput
     *
     * @var string|callable
     */
    public $Debugoutput = 'echo';

    /**
     * Whether to use VERP.
     *
     * @see PHPMailer::$do_verp
     *
     * @var bool
     */
    public $do_verp = false;

    /**
     * The SMTP server timeout in seconds.
     *
     * @var int
     */
    public $Timeout = 300;

    /**
     * The stream context options for the socket connection.
     *
     * @var array
     */
    public $Timelimit = 30;

    /**
     * The stream context options for the socket connection.
     *
     * @var array
     */
    protected $stream_context_options;

    /**
     * The socket for the SMTP connection.
     *
     * @var resource
     */
    protected $smtp_conn;

    /**
     * Error information, if any, for the last SMTP transaction.
     *
     * @var array
     */
    protected $error = [
        'error' => '',
        'detail' => '',
        'smtp_code' => '',
        'smtp_code_ex' => '',
    ];

    /**
     * The reply codes received from the server.
     *
     * @var array
     */
    protected $server_caps = [];

    /**
     * The most recent reply received from the server.
     *
     * @var string
     */
    protected $last_reply = '';

    /**
     * @var int
     */
    protected const DEBUG_OFF = 0;

    /**
     * @var int
     */
    protected const DEBUG_CLIENT = 1;

    /**
     * @var int
     */
    protected const DEBUG_SERVER = 2;

    /**
     * @var int
     */
    protected const DEBUG_CONNECTION = 3;

    /**
     * @var int
     */
    protected const DEBUG_LOWLEVEL = 4;

    /**
     * The function/method to use for debugging output.
     *
     * @var callable
     */
    protected $debug_handler;

    /**
     * The last response to an EHLO or HELO command.
     *
     * @var string
     */
    protected $ehlo_resp;

    /**
     * The connection timeout limit.
     *
     * @var int
     */
    protected $connection_timeout;

    /**
     * Constructor.
     *
     * @param array|null $options The stream context options for the socket connection
     */
    public function __construct($options = null)
    {
        $this->stream_context_options = $options;
        //A callable class method is used to handle debug output
        //so we don't have to keep checking `is_callable()`
        $this->debug_handler = [$this, 'edebug'];
    }

    /**
     * Set the debug output handler.
     *
     * @param callable|string $callable
     */
    public function setDebugOutput($callable)
    {
        $this->Debugoutput = $callable;
    }

    /**
     * Set the debug level.
     *
     * @param int $level
     */
    public function setDebugLevel($level)
    {
        $this->do_debug = $level;
    }

    /**
     * Set the VERP address generation mode.
     *
     * @param bool $enabled
     */
    public function setVerp($enabled)
    {
        $this->do_verp = $enabled;
    }

    /**
     * Set the SMTP timeout.
     *
     * @param int $timeout
     */
    public function setTimeout($timeout)
    {
        $this->Timeout = $timeout;
    }

    /**
     * Connect to an SMTP server.
     *
     * @param string $host    SMTP server IP or host name
     * @param int    $port    The port number to connect to
     * @param int    $timeout How long to wait for the connection to open
     * @param array  $options An array of options for stream_context_create()
     *
     * @return bool
     */
    public function connect($host, $port = null, $timeout = 30, $options = [])
    {
        $this->setError('');
        if ($this->connected()) {
            $this->setError('Already connected to a server');

            return false;
        }
        if (empty($port)) {
            $port = self::DEFAULT_PORT;
        }
        $this->connection_timeout = $timeout;
        $this->smtp_conn = $this->getSMTPConnection($host, $port, $timeout, $options);
        if (!$this->smtp_conn) {
            $this->setError(
                'Failed to connect to server',
                '',
                '0',
                $this->getError()['detail']
            );
            $this->edebug(
                'SMTP ERROR: ' . $this->error['error']
                . ': ' . $this->error['detail'],
                self::DEBUG_CLIENT
            );

            return false;
        }
        $this->edebug('Connection: opening to ' . $host . ':' . $port . ', t=' . $timeout . ', opt=' .
            (empty($options) ? '[]' : json_encode($options)), self::DEBUG_CONNECTION);
        $this->set_socket_timeout($this->Timeout);
        $this->last_reply = $this->get_lines();
        $this->edebug('SERVER -> CLIENT: ' . $this->last_reply, self::DEBUG_SERVER);
        $responseCode = (int) substr($this->last_reply, 0, 3);
        if ($responseCode === 220) {
            return true;
        }
        //This is not an error, but could be ignored
        if ($responseCode === 554) {
            $this->quit();
        }
        //This is a fatal error
        $this->setError(
            'Connect failed',
            $this->last_reply,
            $responseCode
        );
        $this->edebug(
            'SMTP NOTICE: ' . $this->error['error'] . ': ' . $this->last_reply,
            self::DEBUG_CLIENT
        );

        return false;
    }

    /**
     * Get a new SMTP connection.
     *
     * @param string $host
     * @param int    $port
     * @param int    $timeout
     * @param array  $options
     *
     * @return false|resource
     */
    protected function getSMTPConnection($host, $port = null, $timeout = 30, $options = [])
    {
        static $stream_ok;
        if (null === $stream_ok) {
            //It's expensive to test for this, so do it only once
            $stream_ok = function_exists('stream_socket_client');
        }
        $this->setError('');
        $errno = 0;
        $errstr = '';
        if ($stream_ok) {
            $socket_context = stream_context_create($this->getStreamContext($options));
            $connection = stream_socket_client(
                $host . ':' . $port,
                $errno,
                $errstr,
                $timeout,
                STREAM_CLIENT_CONNECT,
                $socket_context
            );
        } else {
            //Fall back to fsockopen which should be enabled on all servers
            $this->edebug(
                'Connection: stream_socket_client is not available, falling back to fsockopen().',
                self::DEBUG_CONNECTION
            );
            $connection = fsockopen(
                $host,
                $port,
                $errno,
                $errstr,
                $timeout
            );
        }

        if (!is_resource($connection)) {
            $this->setError(
                'Failed to connect to server',
                '',
                (string) $errno,
                $errstr
            );
            $this->edebug(
                'SMTP ERROR: ' . $this->error['error'] . ': ' . $errstr . ' (' . $errno . ')',
                self::DEBUG_CLIENT
            );

            return false;
        }

        return $connection;
    }

    /**
     * Get the stream context array for a socket connection.
     *
     * @param array $options
     *
     * @return array
     */
    protected function getStreamContext($options)
    {
        $stream_context = $this->stream_context_options;
        if (!isset($stream_context['ssl'])) {
            $stream_context['ssl'] = [];
        }
        $stream_context['ssl'] = array_merge($stream_context['ssl'], $options);

        return $stream_context;
    }

    /**
     * Initiate a TLS (encrypted) session.
     *
     * @return bool
     */
    public function startTLS()
    {
        if (!$this->sendCommand('STARTTLS', 'STARTTLS', 220)) {
            return false;
        }

        //Allow the best supported protocol version to be negotiated
        $crypto_method = STREAM_CRYPTO_METHOD_TLS_CLIENT;

        //PHP 5.6.7 dropped inclusion of TLS 1.1 and 1.2 in STREAM_CRYPTO_METHOD_TLS_CLIENT
        //so add them back in manually if we can
        if (defined('STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT')) {
            $crypto_method |= STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT;
            $crypto_method |= STREAM_CRYPTO_METHOD_TLSv1_1_CLIENT;
        }

        // Begin encrypted connection
        $this->edebug('Starting TLS', self::DEBUG_CONNECTION);
        set_error_handler([$this, 'errorHandler']);
        $crypto_ok = stream_socket_enable_crypto(
            $this->smtp_conn,
            true,
            $crypto_method
        );
        restore_error_handler();
        if ($crypto_ok) {
            $this->edebug('TLS connection established', self::DEBUG_CONNECTION);

            return true;
        }

        $this->setError('Failed to start TLS');
        $this->edebug($this->getError()['error'] . ': ' . $this->getError()['detail'], self::DEBUG_CLIENT);

        return false;
    }

    /**
     * Error handler for stream_socket_enable_crypto.
     *
     * @param int    $errno
     * @param string $errstr
     * @param string $errfile
     * @param int    $errline
     *
     * @throws Exception
     */
    public function errorHandler($errno, $errstr, $errfile = '', $errline = 0)
    {
        $this->setError(
            'Failed to start TLS',
            '',
            (string) $errno,
            $errstr . ' in ' . $errfile . ' on line ' . $errline
        );
    }

    /**
     * Perform SMTP authentication.
     * Must be run after hello().
     *
     * @param string $username The user name
     * @param string $password The password
     * @param string $authtype The auth type (PLAIN, LOGIN, CRAM-MD5, XOAUTH2)
     * @param OAuth  $OAuth    An optional OAuth instance
     *
     * @return bool True if successfully authenticated
     */
    public function authenticate(
        $username,
        $password,
        $authtype = null,
        $OAuth = null
    ) {
        if (!$this->server_caps) {
            $this->setError('Authentication is not allowed before HELO/EHLO');

            return false;
        }

        if (array_key_exists('EHLO', $this->server_caps)) {
            // SMTP extension guessing
            // Try CRAM-MD5 first, as it's more secure
            if (!array_key_exists('AUTH', $this->server_caps)) {
                $this->setError('Authentication is not supported');

                return false;
            }
            $this->edebug(
                'Authentication methods: ' . implode(', ', $this->server_caps['AUTH']),
                self::DEBUG_LOWLEVEL
            );

            if (null === $authtype) {
                //If we have a choice, we'll try CRAM-MD5 first as it's the most secure
                if (in_array('CRAM-MD5', $this->server_caps['AUTH'], true)) {
                    $authtype = 'CRAM-MD5';
                } elseif (in_array('LOGIN', $this->server_caps['AUTH'], true)) {
                    //Next best is LOGIN
                    $authtype = 'LOGIN';
                } elseif (in_array('PLAIN', $this->server_caps['AUTH'], true)) {
                    //Then PLAIN
                    $authtype = 'PLAIN';
                }
            }
            $authtype = strtoupper($authtype);
            if (!in_array($authtype, $this->server_caps['AUTH'], true)) {
                $this->setError("The specified authentication type '$authtype' is not supported by the server");

                return false;
            }
        } elseif (null === $authtype) {
            //The server is not ESMTP, so we can only try strict plain auth
            $authtype = 'LOGIN';
        }
        $auth_method = 'auth' . $authtype;
        if (!is_callable([$this, $auth_method])) {
            $this->setError("Authentication method '$authtype' is not supported");

            return false;
        }

        return $this->$auth_method($username, $password, $OAuth);
    }

    /**
     * CRAM-MD5 authentication method.
     *
     * @param string $username
     * @param string $password
     *
     * @return bool
     */
    protected function authCRAMMD5($username, $password)
    {
        if (!$this->sendCommand('AUTH CRAM-MD5', 'AUTH CRAM-MD5', 334)) {
            return false;
        }
        //Get the challenge
        $challenge = base64_decode(substr($this->last_reply, 4));

        //Build the response
        $response = $username . ' ' . $this->hmac($challenge, $password);

        //Send the response
        return $this->sendCommand('User Response', base64_encode($response), 235);
    }

    /**
     * NTLM authentication method.
     * This is an experimental implementation, not to be used in production.
     * It is not yet supported by any of the classes that use this one.
     *
     * @param string $username
     * @param string $password
     *
     * @return bool
     *
     * @todo Implement this method fully
     */
    protected function authNTLM($username, $password)
    {
        if (!$this->sendCommand('AUTH NTLM', 'AUTH NTLM', 334)) {
            return false;
        }
        //We need to base64-decode the challenge
        $challenge = base64_decode(substr($this->last_reply, 4));
        $ntlm_client = new NTLM();
        //This is the NTLM Type 1 message
        $type1_msg = $ntlm_client->createType1Message($this->Client);
        //Send the response
        if (!$this->sendCommand('User Response', base64_encode($type1_msg), 334)) {
            return false;
        }
        //We need to base64-decode the challenge
        $challenge = base64_decode(substr($this->last_reply, 4));
        //This is the NTLM Type 3 message
        $type3_msg = $ntlm_client->createType3Message($username, $password, $challenge);

        //Send the response
        return $this->sendCommand('User Response', base64_encode($type3_msg), 235);
    }

    /**
     * HMAC-MD5 RFC 2104 implementation.
     *
     * @param string $data
     * @param string $key
     *
     * @return string
     */
    protected function hmac($data, $key)
    {
        if (function_exists('hash_hmac')) {
            return hash_hmac('md5', $data, $key);
        }

        //The following code is a more-or-less direct port of the example HMAC-MD5 code in RFC 2104
        //Most of it is probably redundant, but it's here just in case
        $opad = str_repeat(chr(0x5c), 64);
        $ipad = str_repeat(chr(0x36), 64);

        if (strlen($key) > 64) {
            $key = pack('H*', md5($key));
        }
        $key = str_pad($key, 64, chr(0x00));

        return md5(($key ^ $opad) . pack('H*', md5(($key ^ $ipad) . $data)));
    }

    /**
     * XOAUTH2 authentication method.
     *
     * @param string $username
     * @param string $password
     * @param OAuth  $OAuth
     *
     * @return bool
     */
    protected function authXOAUTH2($username, $password, $OAuth = null)
    {
        if (null === $OAuth) {
            return false;
        }
        $auth_string = $OAuth->getOauth64();
        if (!$auth_string) {
            return false;
        }
        if (!$this->sendCommand('AUTH XOAUTH2', 'AUTH XOAUTH2 ' . $auth_string, 235)) {
            //Possible timeout
            $this->edebug(
                'XOAUTH2 authentication failed: ' . $this->getError()['error'],
                self::DEBUG_CLIENT
            );

            return false;
        }
        $this->edebug(
            'XOAUTH2 authentication successful.',
            self::DEBUG_CLIENT
        );

        return true;
    }

    /**
     * PLAIN authentication method.
     *
     * @param string $username
     * @param string $password
     *
     * @return bool
     */
    protected function authPLAIN($username, $password)
    {
        if (!$this->sendCommand(
            'AUTH PLAIN',
            'AUTH PLAIN',
            334
        )
        ) {
            return false;
        }
        if (!$this->sendCommand(
            'User Response',
            base64_encode("\0" . $username . "\0" . $password),
            235
        )
        ) {
            return false;
        }

        return true;
    }

    /**
     * LOGIN authentication method.
     *
     * @param string $username
     * @param string $password
     *
     * @return bool
     */
    protected function authLOGIN($username, $password)
    {
        if (!$this->sendCommand('AUTH LOGIN', 'AUTH LOGIN', 334)) {
            return false;
        }
        if (!$this->sendCommand('Username', base64_encode($username), 334)) {
            return false;
        }
        if (!$this->sendCommand('Password', base64_encode($password), 235)) {
            return false;
        }

        return true;
    }
/**
     * Send an RSET command.
     * Aborts the current mail transaction.
     *
     * @return bool
     */
    public function reset()
    {
        return $this->sendCommand('RSET', 'RSET', 250);
    }

    /**
     * Send a QUIT command and close the SMTP socket.
     *
     * @return bool
     */
    public function quit()
    {
        if ($this->sendCommand('QUIT', 'QUIT', 221)) {
            $this->close();

            return true;
        }

        //Fall-through to just closing the connection
        $this->close();

        return false;
    }

    /**
     * Close the SMTP connection.
     */
    public function close()
    {
        $this->setError('');
        if (is_resource($this->smtp_conn)) {
            //Close the connection and cleanup
            fclose($this->smtp_conn);
            $this->smtp_conn = null; //Makes for cleaner serialization
            $this->edebug('Connection: closed', self::DEBUG_CONNECTION);
        }
    }

    /**
     * Get the last reply from the server.
     *
     * @return string
     */
    public function getLastReply()
    {
        return $this->last_reply;
    }

    /**
     * Get a line from the SMTP server.
     *
     * @return string
     */
    protected function get_lines()
    {
        if (!is_resource($this->smtp_conn)) {
            return '';
        }
        $this->Timelimit = $this->Timeout;
        $this->last_reply = '';
        $data = '';
        $loops = 0;
        $time_start = time();
        while (is_resource($this->smtp_conn) && !feof($this->smtp_conn)) {
            //With SMTP+TLS, some servers return an empty response
            $line = fgets($this->smtp_conn, 515);
            $this->edebug('SERVER -> CLIENT: ' . $line, self::DEBUG_LOWLEVEL);
            $data .= $line;
            //If the 4th character is a space, we are done reading, break the loop,
            //otherwise this is a multiline response and we need to keep reading
            if ((isset($line[3]) && $line[3] === ' ')) {
                break;
            }
            if (time() > $time_start + $this->Timelimit) {
                $this->edebug(
                    'SMTP -> get_lines(): timelimit reached',
                    self::DEBUG_LOWLEVEL
                );
                break;
            }
            ++$loops;
            if ($loops > 1000) { //Stop reading after a certain number of loops
                $this->edebug(
                    'SMTP -> get_lines(): too many loops',
                    self::DEBUG_LOWLEVEL
                );
                break;
            }
        }
        $this->last_reply = trim($data);

        return $data;
    }

    /**
     * Send a command to the SMTP server and check the return code.
     *
     * @param string $command      The command name - not sent to the server
     * @param string $command_string The command to send
     * @param int|array $expect     The numeric return code(s) to expect
     *
     * @return bool True on success
     */
    protected function sendCommand($command, $command_string, $expect)
    {
        if (!$this->connected()) {
            $this->setError("Called $command without being connected");

            return false;
        }
        //+1 is for the CRLF
        if (0 !== strpos($command_string, 'EHLO') &&
            strlen($command_string) > (self::MAX_LINE_LENGTH + 1)) {
            $this->setError("Command '$command_string' is too long");
            $this->edebug($this->error['error'], self::DEBUG_CLIENT);

            return false;
        }
        //Send the command
        $this->client_send($command_string . self::EOL);

        //Get the response
        $this->last_reply = $this->get_lines();

        //Now check the reply code
        $this->error = $this->parseReply($this->last_reply);
        $this->edebug('SERVER -> CLIENT: ' . $this->last_reply, self::DEBUG_SERVER);

        if (!is_array($expect)) {
            $expect = [$expect];
        }
        if (!in_array($this->error['smtp_code'], $expect, true)) {
            $this->setError("$command command failed", '', $this->error['smtp_code'], $this->error['detail']);
            $this->edebug(
                'SMTP ERROR: ' . $this->error['error'] . ': ' . $this->last_reply,
                self::DEBUG_CLIENT
            );

            return false;
        }
        $this->setError('');

        return true;
    }

    /**
     * Send a command to the SMTP server.
     * A smaller version of sendCommand that doesn't check the reply code.
     *
     * @param string $command_string The command to send
     *
     * @return int|bool The number of bytes written to the stream or false on error
     */
    protected function client_send($command_string)
    {
        $this->edebug("CLIENT -> SERVER: $command_string", self::DEBUG_CLIENT);

        set_error_handler([$this, 'errorHandler']);
        $result = fwrite($this->smtp_conn, $command_string);
        restore_error_handler();

        return $result;
    }



