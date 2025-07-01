<?php
/**
 * PHPMailer - A full-featured email creation and transfer class for PHP
 *
 * @author    Marcus Bointon <phpmailer@synchromedia.co.uk>
 * @author    Jim Jagielski <jim.jagielski@gmail.com>
 * @author    Andy Prevost <codeworxtech@users.sourceforge.net>
 * @author    Brent R. Matzelle <bmatzelle@yahoo.com>
 * @copyright 2001 - 2020, Marcus Bointon
 * @copyright 2010 - 2014, Jim Jagielski
 * @see       https://github.com/PHPMailer/PHPMailer/
 * @license   http://www.gnu.org/copyleft/lesser.html GNU Lesser General Public License
 * @note      This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 */

namespace PHPMailer\PHPMailer;

/**
 * PHPMailer - A full-featured email creation and transfer class for PHP.
 *
 * @property string $Version
 * @property int    $Priority
 * @property string $CharSet
 * @property string $ContentType
 * @property string $Encoding
 * @property string $ErrorInfo
 * @property string $From
 * @property string $FromName
 * @property string $Sender
 * @property string $Subject
 * @property string $Body
 * @property string $AltBody
 * @property string $Ical
 * @property string $WordWrap
 * @property string $Mailer
 * @property string $Sendmail
 * @property bool   $UseSendmailOptions
 * @property string $PluginDir
 * @property string $ConfirmReadingTo
 * @property string $Hostname
 * @property string $MessageID
 * @property string $MessageDate
 * @property int    $Port
 * @property string $Host
 * @property string $Helo
 * @property string $SMTPSecure
 * @property bool   $SMTPAutoTLS
 * @property bool   $SMTPAuth
 * @property string $Username
 * @property string $Password
 * @property string $AuthType
 * @property array  $Realm
 * @property array  $Client
 * @property int    $Timeout
 * @property bool   $SMTPKeepAlive
 * @property bool   $SingleTo
 * @property bool   $do_verp
 * @property bool   $AllowEmpty
 * @property string $DKIM_selector
 * @property string $DKIM_identity
 * @property string $DKIM_passphrase
 * @property string $DKIM_domain
 * @property bool   $DKIM_copyHeaderField
 * @property string $DKIM_private
 * @property string $DKIM_private_string
 * @property string $action_function
 * @property string $XMailer
 * @property SMTP   $smtp
 * @property array  $to
 * @property array  $cc
 * @property array  $bcc
 * @property array  $ReplyTo
 * @property array  $all_recipients
 * @property array  $RecipientsQueue
 * @property array  $ReplyToQueue
 * @property array  $attachment
 * @property array  $CustomHeader
 * @property string $MIMEBody
 * @property string $MIMEHeader
 * @property string $mailHeader
 * @property int    $SMTPDebug
 * @property bool   $Debugoutput
 * @property bool   $exceptions
 * @property string $Helo
 */
class PHPMailer
{
    /**
     * The PHPMailer Version number.
     *
     * @var string
     */
    public $Version = '6.1.6';

    /**
     * Email priority.
     * Options: null (default), 1 (High), 3 (Normal), 5 (Low).
     * When null, the header is not set at all.
     *
     * @var int
     */
    public $Priority;

    /**
     * The character set of the message.
     *
     * @var string
     */
    public $CharSet = self::CHARSET_ISO88591;

    /**
     * The MIME Content-type of the message.
     *
     * @var string
     */
    public $ContentType = self::CONTENT_TYPE_TEXT_PLAIN;

    /**
     * The message's MIME encoding.
     * Must be one of '8bit', '7bit', 'binary', 'base64', or 'quoted-printable'.
     *
     * @var string
     */
    public $Encoding = '8bit';

    /**
     * Holds the most recent mailer error message.
     *
     * @var string
     */
    public $ErrorInfo = '';

    /**
     * The From email address for the message.
     *
     * @var string
     */
    public $From = 'root@localhost';

    /**
     * The From name of the message.
     *
     * @var string
     */
    public $FromName = 'Root User';

    /**
     * The Sender email (Return-Path) of the message.
     * If not empty, will be sent via -f to sendmail or as the 'MAIL FROM' value over SMTP.
     *
     * @var string
     */
    public $Sender = '';

    /**
     * The Subject of the message.
     *
     * @var string
     */
    public $Subject = '';

    /**
     * An HTML or plain text message body.
     * If HTML, equals $MIMEBody.
     *
     * @var string
     */
    public $Body = '';

    /**
     * The plain-text message body.
     * This body can be read by mail clients that do not have HTML email
     * capability such as mutt & Eudora.
     * Clients that can read HTML will view the normal Body.
     *
     * @var string
     */
    public $AltBody = '';

    /**
     * An iCal message part body.
     * Only supported in simple alt or alt_inline message types
     * To generate iCal event structures, use classes like EasyPeasyICS.
     *
     * @see http://sprain.ch/blog/downloads/php-class-easypeasyics-create-ical-files-with-php/
     *
     * @var string
     */
    public $Ical = '';

    /**
     * The number of lines after which to split message body into chunks.
     * Set to 0 to not wrap. A useful value is 78, for RFC2822 section 2.1.1 compliance.
     *
     * @var int
     */
    public $WordWrap = 0;

    /**
     * Method to send mail.
     * Options: 'mail', 'sendmail', or 'smtp'.
     *
     * @var string
     */
    public $Mailer = 'mail';
    /**
     * The path to the sendmail program.
     *
     * @var string
     */
    public $Sendmail = '/usr/sbin/sendmail';

    /**
     * Whether to use sendmail's -t option.
     * The -t option is used to find recipients in the message headers.
     * This is disabled by default, because it may cause problems with non-compliant MTAs.
     *
     * @see https://www.postfix.org/sendmail.1.html
     *
     * @var bool
     */
    public $UseSendmailOptions = true;

    /**
     * Path to PHPMailer plugins.
     * Useful if you have them in a different directory than the main class.
     *
     * @var string
     */
    public $PluginDir = '';

    /**
     * The email address that a reading confirmation will be sent to.
     *
     * @var string
     */
    public $ConfirmReadingTo = '';

    /**
     * The hostname to use in the Message-ID header and as default HELO string.
     * If empty, PHPMailer attempts to find one with, in order,
     * $_SERVER['SERVER_NAME'], $_SERVER['SERVER_ADDR'], and 'localhost.localdomain'.
     *
     * @var string
     */
    public $Hostname = '';

    /**
     * An ID to be used in the Message-ID header.
     * If empty, a unique id will be generated.
     * You can set your own, but it must be in the format '<id@domain>',
     * as defined in RFC5322 section 3.6.4 or it will be ignored.
     *
     * @see https://tools.ietf.org/html/rfc5322#section-3.6.4
     *
     * @var string
     */
    public $MessageID = '';

    /**
     * The message Date to be used in the Date header.
     * If empty, the current date will be added.
     *
     * @var string
     */
    public $MessageDate = '';

    /**
     * The TCP port number to use for SMTP connections.
     * Can be overridden by setting $Host to 'host:port'.
     *
     * @var int
     */
    public $Port = 25;

    /**
     * The SMTP server host.
     * Can be a single hostname or a space/semicolon-separated list of hosts.
     * You can also specify a port number for each host, for example 'smtp1.example.com:25;smtp2.example.com'.
     * You can also specify encryption type, for example 'ssl://smtp.example.com:465'.
     *
     * @var string
     */
    public $Host = 'localhost';

    /**
     * The HELO string to send to the SMTP server.
     *
     * @var string
     */
    public $Helo = '';

    /**
     * What kind of encryption to use on the SMTP connection.
     * Options: '', 'ssl' or 'tls'.
     *
     * @var string
     */
    public $SMTPSecure = '';

    /**
     * Whether to enable TLS encryption automatically if a server supports it,
     * even if `SMTPSecure` is not set to 'tls'.
     * Be aware that in PHP >= 5.6 this requires that the server's certificates are valid.
     *
     * @var bool
     */
    public $SMTPAutoTLS = true;

    /**
     * Whether to use SMTP authentication.
     * Uses the Username and Password properties.
     *
     * @see    $Username
     * @see    $Password
     *
     * @var bool
     */
    public $SMTPAuth = false;

    /**
     * SMTP username.
     *
     * @var string
     */
    public $Username = '';

    /**
     * SMTP password.
     *
     * @var string
     */
    public $Password = '';

    /**
     * SMTP auth type.
     * Options are 'PLAIN', 'LOGIN', 'CRAM-MD5', 'XOAUTH2'.
     *
     * @var string
     */
    public $AuthType = '';

    /**
     * The realm for CRAM-MD5 authentication.
     *
     * @var string
     */
    public $Realm = '';

    /**
     * The client workstation name for NTLM authentication.
     *
     * @var string
     */
    public $Client = '';

    /**
     * The SMTP server timeout in seconds.
     * Default of 5 minutes is from RFC2821 section 4.5.3.2.
     *
     * @var int
     */
    public $Timeout = 300;

    /**
     * The SMTP HELO name to use.
     *
     * @var int
     */
    public $SMTPDebug = 0;

    /**
     * How to handle debug output.
     * Options:
     * * `echo` Output plain-text as-is, appropriate for CLI
     * * `html` Output escaped, line-breaked HTML, appropriate for browser output
     * * `error_log` Output to error log
     * Alternatively, you can provide a callable expecting two params: a message string and the debug level:
     * `function(string $str, int $level)`
     *
     * @var string|callable
     */
    public $Debugoutput = 'echo';

    /**
     * Whether to keep SMTP connection open after sending each message.
     * If this is set to true, you must close the connection manually using smtpClose().
     *
     * @var bool
     */
    public $SMTPKeepAlive = false;

    /**
     * Whether to send messages with a single recipient SMTP FROM/TO sequence.
     * If this is set to true, you must call send() for each recipient.
     *
     * @var bool
     */
    public $SingleTo = false;

    /**
     * Should we generate VERP addresses when sending?
     *
     * @see https://en.wikipedia.org/wiki/Variable_envelope_return_path
     *
     * @var bool
     */
    public $do_verp = false;

    /**
     * Whether to allow sending messages with an empty body.
     *
     * @var bool
     */
    public $AllowEmpty = false;

    /**
     * The DKIM selector.
     *
     * @var string
     */
    public $DKIM_selector = '';

    /**
     * The DKIM Identity.
     * Usually the email address used as the source of the email.
     *
     * @var string
     */
    public $DKIM_identity = '';

    /**
     * The DKIM passphrase.
     * Used if your key is encrypted.
     *
     * @var string
     */
    public $DKIM_passphrase = '';

    /**
     * The DKIM signing domain.
     *
     * @example 'example.com'
     *
     * @var string
     */
    public $DKIM_domain = '';

    /**
     * Whether to copy header fields for DKIM signing.
     *
     * @var bool
     */
    public $DKIM_copyHeaderFields = true;

    /**
     * The DKIM private key file path.
     *
     * @var string
     */
    public $DKIM_private = '';

    /**
     * The DKIM private key string.
     * If this is set, `DKIM_private` is ignored.
     *
     * @var string
     */
    public $DKIM_private_string = '';

    /**
     * A callback function for custom validation.
     *
     * @var callable
     */
    public $action_function = '';

    /**
     * The X-Mailer header string.
     * Defaults to 'PHPMailer <version> (<url>)'.
     *
     * @var string
     */
    public $XMailer = '';

    /**
     * An instance of the SMTP sender class.
     *
     * @var SMTP
     */
    protected $smtp;

    /**
     * The array of 'to' names and addresses.
     *
     * @var array
     */
    protected $to = [];

    /**
     * The array of 'cc' names and addresses.
     *
     * @var array
     */
    protected $cc = [];

    /**
     * The array of 'bcc' names and addresses.
     *
     * @var array
     */
    protected $bcc = [];

    /**
     * The array of reply-to names and addresses.
     *
     * @var array
     */
    protected $ReplyTo = [];

    /**
     * An array of all kinds of addresses.
     * Includes addresses from 'to', 'cc', 'bcc', and 'reply-to'.
     *
     * @var array
     */
    protected $all_recipients = [];

    /**
     * An array of names and addresses queued for validation.
     *
     * @var array
     */
    protected $RecipientsQueue = [];

    /**
     * An array of reply-to names and addresses queued for validation.
     *
     * @var array
     */
    protected $ReplyToQueue = [];

    /**
     * The array of attachments.
     *
     * @var array
     */
    protected $attachment = [];

    /**
     * The array of custom headers.
     *
     * @var array
     */
    protected $CustomHeader = [];

    /**
     * The message's MIME Body.
     *
     * @var string
     */
    protected $MIMEBody = '';

    /**
     * The message's MIME Header.
     *
     * @var string
     */
    protected $MIMEHeader = '';

    /**
     * The message's mail Header.
     *
     * @var string
     */
    protected $mailHeader = '';

    /**
     * Whether to throw exceptions for errors.
     *
     * @var bool
     */
    protected $exceptions = false;

    /**
     * The last boundaries used in a message.
     *
     * @var array
     */
    protected $lastBoundaries = [];

    /**
     * @var string
     */
    protected const CHARSET_ASCII = 'us-ascii';

    /**
     * @var string
     */
    protected const CHARSET_ISO88591 = 'iso-8859-1';

    /**
     * @var string
     */
    protected const CHARSET_UTF8 = 'utf-8';

    /**
     * @var string
     */
    protected const CONTENT_TYPE_PLAINTEXT = 'text/plain';

    /**
     * @var string
     */
    protected const CONTENT_TYPE_TEXT_HTML = 'text/html';

    /**
     * @var string
     */
    protected const CONTENT_TYPE_MULTIPART_ALTERNATIVE = 'multipart/alternative';

    /**
     * @var string
     */
    protected const CONTENT_TYPE_MULTIPART_MIXED = 'multipart/mixed';

    /**
     * @var string
     */
    protected const CONTENT_TYPE_MULTIPART_RELATED = 'multipart/related';

    /**
     * @var string
     */
    protected const ENCODING_7BIT = '7bit';

    /**
     * @var string
     */
    protected const ENCODING_8BIT = '8bit';

    /**
     * @var string
     */
    protected const ENCODING_BASE64 = 'base64';

    /**
     * @var string
     */
    protected const ENCODING_BINARY = 'binary';

    /**
     * @var string
     */
    protected const ENCODING_QUOTED_PRINTABLE = 'quoted-printable';

    /**
     * @var int
     */
    public const DEBUG_OFF = 0;

    /**
     * @var int
     */
    public const DEBUG_CLIENT = 1;

    /**
     * @var int
     */
    public const DEBUG_SERVER = 2;

    /**
     * @var int
     */
    public const DEBUG_CONNECTION = 3;

    /**
     * @var int
     */
    public const DEBUG_LOWLEVEL = 4;

    /**
     * The lower-level debug output buffer.
     *
     * @var string
     */
    protected $Debugoutput_buffer = '';

    /**
     * Constructor.
     *
     * @param bool $exceptions Should we throw external exceptions?
     */
    public function __construct($exceptions = null)
    {
        if (null !== $exceptions) {
            $this->exceptions = (bool) $exceptions;
        }
        // Whether to use VERP.
        $this->smtp = new SMTP();
    }


/**
     * Destructor.
     */
    public function __destruct()
    {
        //Close any open SMTP connection automatically
        $this->smtpClose();
    }

    /**
     * Call mail() in a safe_mode environment.
     *
     * @param string      $to
     * @param string      $subject
     * @param string      $body
     * @param string      $header
     * @param string|null $params
     *
     * @return bool
     */
    private function mailPassthru($to, $subject, $body, $header, $params)
    {
        //Check for safe mode by trying to exec 'id'
        if (ini_get('safe_mode') || !($this->UseSendmailOptions && preg_match('#\@\w+.\w+#', $to))) {
            //@mail uses safe_mode_exec_dir, which can be configured via php.ini
            $rt = @mail($to, $this->encodeHeader($this->Subject), $body, $header);
        } else {
            $rt = @mail($to, $this->encodeHeader($this->Subject), $body, $header, $params);
        }

        return $rt;
    }

    /**
     * Output a debug message.
     *
     * @param string $str
     * @param int    $level
     *
     * @see SMTP::$Debugoutput
     */
    protected function edebug($str, $level = 0)
    {
        if ($level > $this->SMTPDebug) {
            return;
        }
        //Avoid clash with built-in function names
        if (!is_callable($this->Debugoutput)) {
            //Avoid script tags in debug output
            $str = htmlspecialchars($str, ENT_COMPAT | ENT_HTML401);
            if ('error_log' === $this->Debugoutput) {
                error_log($str);

                return;
            }
            if ('html' === $this->Debugoutput) {
                //Cleans up output a bit for a better looking, HTML-safe output
                $str = nl2br(str_replace('>', '&gt;', str_replace('<', '&lt;', $str)));
            }
            echo gmdate('Y-m-d H:i:s') . "\t" . str_replace(
                "\n",
                "\n\t                  \t",
                trim($str)
            ) . "<br />\n";

            return;
        }

        call_user_func($this->Debugoutput, $str, $level);
    }