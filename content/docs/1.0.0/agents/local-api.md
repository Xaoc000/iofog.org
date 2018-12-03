---
title: "Local API Reference"
category: "Agents"
type: "documentation"
version: "1.0.0"
---

# Agent Local API Reference
  - [ioMessages Format](#iomessages)
  - [API Endpoints](#api-endpoints)

The Agent daemon supports a local API with REST-like endpoints as well as WebSockets.

All messages passing through the Local API must be in the [ioMessage format](iomessages). Note that the ContextData and ContentData fields of all messages must be base64 encoded when sending messages in a JSON response. All incoming messages will also have these fields base64 encoded and will need to be decoded upon arrival. No other fields should be encoded, because all other fields are capable of being transmitted directly as JSON. This allows containers to quickly examine an incoming message InfoType and InfoFormat to see if performing the base64 decoding is worthwhile.

If a message InfoFormat is actually base64, then it will be encoded again during transmission as JSON. While this is not very efficient, it is sustainable as a practice. Neither the ioFog Local API nor the containers need to examine messages to determine the type of encoding. They both simply decode arriving messages and encode messages before sending (just the ContextData and ContentData fields).

<aside class="notifications note">
  <h3><img src="/images/icos/ico-note.svg" alt=""> SDKs are available!</h3>
  <p>While this API is public, it is a relatively low-level. We have SDK libraries for many popular languages to make it easier <a href="sdk"></a> View Available SDKs.</p>
</aside>

All messages sent and received using the Local API must be in the standard ioMessage format, which can be found in the ioMessage Specification document.

## ioMessages
The purpose of a message is move information along a path. No understanding of the contents of the messages should be required in order to help it to its correct destination. The header fields of each message, however, are intended to be read and understood by functional pieces of the iofog system. Because the data contents of the message format are open, that means each recipient will be required to determine for itself if it understands how to read the data. Recipients can check the information type and information format headers to determine this.

The ioMessage versions are integers, not decimals. This is because it is harder to parse a raw binary message with decimals across different computing platforms. So... ioMessage versions will be things like 4, 5, and 12. The version can be used to determine what fields will be present in the message and perhaps how the data will be arranged in those fields.

The ID for each message must be unique across the Earth for 20 years or longer. Depending on the volume of ioMessages across the globe, a 128-bit identifier may reach a 99.9%+ chance of collisions well before that timeframe ends. So a 256-bit identifier has been chosen and should suffice.

The fields listed here do not contain any formatting information except for the ID, which is strictly standardized. Each embodiment of the ioMessage standard will make use of the best features of the embodiment method. For example, when using JSON to create ioMessages, there is no need to include length information about the different fields. And there is no need to put any particular field in any particular position. XML is similar. But when encoding an ioMessage in raw bytes, the order of the information is very crucial for packing and parsing the messages. While JSON and XML offer some advantages, they also have more overhead than raw bytes. And while raw byte formatting requires parsing by the receiver, it also has very low overhead and is excellent for real-time transmission of media such as photos or video.

A listing for JSON, XML, and raw bytes is included in this document after the main field listing.

### Fields of an ioMessage

#### ID
| | |
|---|---|
|*Data Type*|Text|
|*Key*|ID|
|*Required*|Yes|
|*Description*|A 256-bit universally unique identifier per message allows for portability and globe-wide verification of events. The ID string is formatted in base58 for readability, transmission safety between systems, and compactness.|

#### Tag
|   |   |
|---|---|
|*Data Type*|Text|
|*Key*|Tag|
|*Required*|No|
|*Description*|This is an open field for associating a message with a particular device or any other interesting thing. It should be queryable later, making this a high-value field for some applications.|
</pre>

#### Message Group ID
|   |   |
|---|---|
|*Data Type*|Text|
|*Key*|GroupID|
|*Required*|No|
|*Description*|This is how messages can be allocated to a sequence or stream.|
</pre>

#### Sequence Number
|   |   |
|---|---|
|*Data Type*|Integer|
|*Key*|SequenceNumber|
|*Required*|No|
|*Description*|What number in the sequence is this current message?|
</pre>

#### Sequence Total
|   |   |
|---|---|
|*Data Type*|Integer|
|*Key*|SequenceTotal|
|*Required*|No|
|*Description*|How many total messages are in the sequence? Absence of a total count while sequence numbers and a message group ID are present may be used to indicate a stream with indeterminate length.|
</pre>

#### Priority
|   |   |
|---|---|
|*Data Type*|Integer|
|*Key*|Priority|
|*Required*|No|
|*Description*|The lower the number, the higher the priority. This is a simple quality of service (QoS) indicator. Emergency messages or system error logs might get the highest priority. Self-contained messages (such as a button push or a temperature reading) might get very high priority. Media stream messages (such as one second of audio) might get very low priority ranking in order to allow message slowing or dropping as needed in a busy system.|
</pre>

#### Timestamp
|   |   |
|---|---|
|*Data Type*|Integer|
|*Key*|Timestamp|
|*Required*|Yes|
|*Description*|Universal timecode including milliseconds. Milliseconds can be entered as zeroes if needed.|
</pre>

#### Publisher
|   |   |
|---|---|
|*Data Type*|Text|
|*Key*|Publisher|
|*Required*|Yes|
|*Description*|This is the identifier of the element that is sending the message. It can be used to determine routing or guarantee privacy and security. Because each element is assigned a UUID during configuration, even across ioFog instances no message should be received by an unintended entity.|
</pre>

#### Authentication Identifier
|   |   |
|---|---|
|*Data Type*|Text|
|*Key*|AuthID|
|*Required*|No|
|*Description*|This is an open field to pass along authentication information about the particular authorized entity generating the message, such as an employee ID number or a user ID in the application.|
</pre>

#### Authentication Group
|   |   |
|---|---|
|*Data Type*|Text|
|*Key*|AuthGroup|
|*Required*|No|
|*Description*|This is an open field to pass authentication group information. This allows pieces of the application to know they are dealing with a message from an authenticated user of a particular type (such as “employee” or “system admin”) without needing to know the actual identification information.|
</pre>

#### ioMessage Version
|   |   |
|---|---|
|*Data Type*|Integer|
|*Key*|Version|
|*Required*|Yes|
|*Description*|Which version of the ioMessage format does this particular message comply with?|
</pre>

#### Chain Position
|   |   |
|---|---|
|*Data Type*|Integer|
|*Key*|ChainPosition|
|*Required*|No|
|*Description*|When using cryptographic message chaining, this field represents the position in the message chain that this paricular message occupies. It is similar to the "block height" value found in blockchain technology.|
</pre>

#### Hash
|   |   |
|---|---|
|*Data Type*|Text|
|*Key*|Hash|
|*Required*|No|
|*Description*|When using cryptographic message chaining, a hash of this entire message can be included here.|
</pre>

#### Previous Message Hash
|   |   |
|---|---|
|*Data Type*|Text|
|*Key*|PreviousHash|
|*Required*|No|
|*Description*|When using cryptographic message chaining, the hash value of the previous message is included here. This forms the cryptographic link from the prior message to this one.|
</pre>

#### Nonce
|   |   |
|---|---|
|*Data Type*|Text|
|*Key*|Nonce|
|*Required*|No|
|*Description*|When using cryptographic message chaining, an open field is needed to achieve the correct hash value. The information in this field will not be meaningful, but will be necessary to produce the final hash of the message.|
</pre>

#### Difficulty Target
|   |   |
|---|---|
|*Data Type*|Integer|
|*Key*|DifficultyTarget|
|*Required*|No|
|*Description*|When using cryptographic message chaining, this field represents the hashing workload required to cryptographically seal the chain.|
</pre>

#### Information Type
|   |   |
|---|---|
|*Data Type*|Text|
|*Key*|InfoType|
|*Required*|Yes|
|*Description*|This is like a MIME type. It describes what type of information is contained in the content data field.|
</pre>

#### Information Format
|   |   |
|---|---|
|*Data Type*|Text|
|*Key*|InfoFormat|
|*Required*|Yes|
|*Description*|This is a sub-field of the Information Type. It defines the format of the data content in this message. If the information type is “Temperature”, for example, then the information format might be “Degrees Kelvin”.|
</pre>

#### Context Data
|   |   |
|---|---|
|*Data Type*|Any (including binary, text, integer, etc.)|
|*Key*|ContextData|
|*Required*|No|
|*Description*|Context data in raw bytes. This field can be used to embed any information desired and will likely be very different from one solution to the next. It is the responsibility of the receiving element(s) to understand the context data format and the meaning of the context information.|
</pre>

#### Data Content
|   |   |
|---|---|
|*Data Type*|Any (including binary, text, integer, etc.)|
|*Key*|ContentData|
|*Required*|Yes|
|*Description*|The actual data content of the message in its raw form. Having a raw format for this field allows for the greatest amount of flexibility in the system.|
</pre>


### JSON Embodiment of an ioMessage
The ContextData and ContentData fields of an ioMessage, when embodied in JSON, will always be base64 encoded. This is because these fields contain raw bytes and there is no other way to represent raw bytes in the utf-8 structure that JSON uses. Upon receiving a JSON ioMessage, you must base64 decode those two fields. Before sending a JSON ioMessage, you must base64 encode those two fields.

```json
	{
		"id":"sd098wytfskduhdsfDSKfhjw4o8ytwesdoiuhsdf",
		"tag":"Bosch Camera 16",
		"groupid":"",
		"sequencenumber":1,
		"sequencetotal":1,
		"priority":0,
		"timestamp":1234567890123,
		"publisher":"Ayew98wtosdhFSKdjhsdfkjhkjesdhg",
		"authid":"",
		"authgroup":"",
		"version":4,
		"chainposition":0,
		"hash":"",
		"previoushash":"",
		"nonce":"",
		"difficultytarget":0.0,
		"infotype":"image/jpeg",
		"infoformat":"file/.jpg",
		"contextdata":"",
		"contentdata":"sdkjhwrtiy8wrtgSDFOiuhsrgowh4touwsdhsDFDSKJhsdkljasjklweklfjwhefiauhw98p328946982weiusfhsdkufhaskldjfslkjdhfalsjdf=serg4towhr"
	}
```


### XML Embodiment of an ioMessage

The ContextData and ContentData fields of an ioMessage, when embodied in XML, will always be base64 encoded. This is because these fields contain raw bytes and there is no other way to represent raw bytes in the text formats that XML uses. Upon receiving an XML ioMessage, you must base64 decode those two fields. Before sending an XML ioMessage, you must base64 encode those two fields.

<pre>
&lt;iomessage&gt;
  &lt;id&gt;sd098wytfskduhdsfDSKfhjw4o8ytwesdoiuhsdf&lt;/id&gt;
  &lt;tag&gt;Bosch Camera 16&lt;/tag&gt;
  &lt;groupid&gt;&lt;/groupid&gt;
  &lt;sequencenumber&gt;1&lt;/sequencenumber&gt;
  &lt;sequencetotal&gt;1&lt;/sequencetotal&gt;
  &lt;priority&gt;0&lt;/priority&gt;
  &lt;timestamp&gt;1234567890123&lt;/timestamp&gt;
  &lt;publisher&gt;Ayew98wtosdhFSKdjhsdfkjhkjesdhg&lt;/publisher&gt;
  &lt;authid&gt;&lt;/authid&gt;
  &lt;authgroup&gt;&lt;/authgroup&gt;
  &lt;version&gt;4&lt;/version&gt;
  &lt;chainposition&gt;0&lt;/chainposition&gt;
  &lt;hash&gt;&lt;/hash&gt;
  &lt;previoushash&gt;&lt;/previoushash&gt;
  &lt;nonce&gt;&lt;/nonce&gt;
  &lt;difficultytarget&gt;0.0&lt;/difficultytarget&gt;
  &lt;infotype&gt;image/jpeg&lt;/infotype&gt;
  &lt;infoformat&gt;file/.jpg&lt;/infoformat&gt;
  &lt;contextdata&gt;&lt;/contextdata&gt;
  &lt;contentdata&gt;sDFDSKJhsdkljasjklweklfjwhefiauhw98p328946982weiusfhsdkufha&lt;/contentdata&gt;
&lt;/iomessage&gt;
</pre>


### Binary Embodiment of an ioMessage

Bytes are octets here. No funny business. Just good old 8-bit bytes. The sequence of bytes here must be followed strictly so the message can be parsed by the receiver.

<pre>
[2 bytes] - Version

[1 bytes] - Length of ID field
[2 bytes] - Length of Tag field
[1 bytes] - Length of Group ID field
[1 bytes] - Length of Sequence Number field
[1 bytes] - Length of Sequence Total field
[1 bytes] - Length of Priority field
[1 bytes] - Length of Timestamp field
[1 bytes] - Length of Publisher field
[2 bytes] - Length of Auth ID field
[2 bytes] - Length of Auth Group field
[1 bytes] - Length of Chain Position field
[2 bytes] - Length of Hash field
[2 bytes] - Length of Previous Hash field
[2 bytes] - Length of Nonce field
[1 bytes] - Length of Difficulty Target field
[1 bytes] - Length of Info Type field
[1 bytes] - Length of Info Format field
[4 bytes] - Length of Context Data field
[4 bytes] - Length of Content Data field

[n bytes] - ID value
[n bytes] - Tag value
[n bytes] - Group ID value
[n bytes] - Sequence Number value
[n bytes] - Sequence Total value
[n bytes] - Priority value
[n bytes] - Timestamp value
[n bytes] - Publisher value
[n bytes] - Auth ID value
[n bytes] - Auth Group value
[n bytes] - Chain Position value
[n bytes] - Hash value
[n bytes] - Previous Hash value
[n bytes] - Nonce value
[n bytes] - Difficulty Target value
[n bytes] - Info Type value
[n bytes] - Info Format value
[n bytes] - Context Data value
[n bytes] - Content Data value
</pre>

## API Endpoints
#### Get Container Configuration

This endpoint provides the current JSON configuration string for the requesting container. Containers identify themselves by their element ID, which is mapped into the container as an environment variable.

##### Endpoint

<pre>
http://iofog:54321/v2/config/get
</pre>

##### Response

```json
{
  "status":"okay",
  "config":"{\"property1\":\"value1\",\"property2\":\"value2\"}"
}
```

##### Querystring Parameters

<pre>
	None
</pre>

##### POST Parameters

```json
{"id":"R4b2WPZRbycCzyZBz9tD7BdMWg94YDhQ"}

// Note: The POST value is JSON and must be sent
// with HTTP header set as “Content-Type:application/json”
```


#### Get Container Next Unread Messages

This endpoint returns a JSON array containing all of the unread messages for this container up to this point. Receiving the messages clears them from the queue so a following call to this API endpoint will not contain the same messages.

##### Endpoint

<pre>
http://iofog:54321/v2/messages/next
</pre>

##### Response

```json
{
  "status":"okay",
  "count":2,
  "messages":
    [
      {
        "id":"ObJ5STY02PMLM4XKXM8oSuPlc7mUh5Ej",
        "tag":"",
        "groupid":"",
        "sequencenumber":1,
        "sequencetotal":1,
        "priority":0,
        "timestamp":1452214777495,
        "publisher":"R4b2WPZRbycCzyZBz9tD7BdMWg94YDhQ",
        "authid":"",
        "authgroup":"",
        "version":4,
        "chainposition":0,
        "hash":"",
        "previoushash":"",
        "nonce":"",
        "difficultytarget":0.0,
        "infotype":"text",
        "infoformat":"utf-8",
        "contextdata":"",
        "contentdata":"8943asefSDhdkljsafhasldkjhfdlk==wehj23"
      },
      {
        "id":"sd098wytfskduhdsfDSKfhjw4o8ytwesdoiuhsdf",
        "tag":"Bosch Camera 16",
        "groupid":"",
        "sequencenumber":1,
        "sequencetotal":1,
        "priority":0,
        "timestamp":1234567890123,
        "publisher":"Ayew98wtosdhFSKdjhsdfkjhkjesdhg",
        "authid":"",
        "authgroup":"",
        "version":4,
        "chainposition":0,
        "hash":"",
        "previoushash":"",
        "nonce":"",
        "difficultytarget":0.0,
        "infotype":"image/jpeg",
        "infoformat":"file/.jpg",
        "contextdata":"",
        "contentdata":"sdkjhwrtiy8wrtgSDFOiuhsrgowh4touwsdhsDFDSKJhsdkljasjklweklfjwhefiauhw98p328946982weiusfhsdkufhaskldjfslkjdhfalsjdf=serg4towhr"
      }
    ]
}
```

##### Querystring Parameters

<pre>
	None
</pre>

##### POST Parameters

```json
{
  "id": "R4b2WPZRbycCzyZBz9tD7BdMWg94YDhQ"
}

// Note: The POST value is JSON and must be sent with
// HTTP header set as “Content-Type:application/json”
```


#### Post Message

This endpoing allows a container to post a message to the system. The message ID is generated inside the ioFog system, so it is not passed by the container when posting the message. The timestamp is not generated by the container, either. Both of these are returned in the repsonse from this endpoint. This prevents time synchronization problems and unique identifier problems from taking place in the container, where the language, frameworks, and code quality are unknown.

##### Endpoint

<pre>
http://iofog:54321/v2/messages/new
</pre>

##### Response

<pre>
{
  "status":"okay",
  "timestamp":1234567890123,
  "id":"f9y43trfdsSDFkjhdso8y4twouhsdfksjhdf2o834wyr4we"
}
</pre>

##### Querystring Parameters

<pre>
None
</pre>

##### POST Parameters

```json
{
  "tag":"",
  "groupid":"",
  "sequencenumber":1,
  "sequencetotal":1,
  "priority":0,
  "publisher":"R4b2WPZRbycCzyZBz9tD7BdMWg94YDhQ",
  "authid":"",
  "authgroup":"",
  "version":4,
  "chainposition":0,
  "hash":"",
  "previoushash":"",
  "nonce":"",
  "difficultytarget":0.0,
  "infotype":"text",
  "infoformat":"utf-8",
  "contextdata":"",
  "contentdata":"42h3isuhsdlukhfsd==w3efakhsfdkljhafs"
}

// Note: The POST value is JSON and must be sent with
// HTTP header set as “Content-Type:application/json”
```


#### Get Messages From Publishers Within Timeframe

This endpoint allows a container to query for messages from any number of publishers within any timeframe. The messages will only be provided for publishers that the container is allowed to access. In other words, if a container doesn't normally receive messages from a particular publisher, then the container can try to query for messages from that publisher but it won't receive any. The message retrieval and security controls are all performed by the Message Bus module and the allowed messages are passed to the Local API to send out.

Beause of memory limitations, the Local API may only send a portion of the requested messages. The Local API will decide how many messages are appropriate to send and will return the adjusted starting and ending timeframe as illustrated in the sample response output below. The Local API will always use the starting timeframe and will adjust the ending timeframe to reflect the timestamp of the actual last message in the list.

##### Endpoint

<pre>
http://iofog:54321/v2/messages/query
</pre>

##### Response

```json
{
  "status":"okay",
  "count":2,
  "timeframestart":1234567890123,
  "timeframeend":9876543210123,
  "messages":
    [
      {
        "id":"ObJ5STY02PMLM4XKXM8oSuPlc7mUh5Ej",
        "tag":"",
        "groupid":"",
        "sequencenumber":1,
        "sequencetotal":1,
        "priority":0,
        "timestamp":1452214777495,
        "publisher":"R4b2WPZRbycCzyZBz9tD7BdMWg94YDhQ",
        "authid":"",
        "authgroup":"",
        "version":4,
        "chainposition":0,
        "hash":"",
        "previoushash":"",
        "nonce":"",
        "difficultytarget":0.0,
        "infotype":"text",
        "infoformat":"utf-8",
        "contextdata":"",
        "contentdata":"wei8y43ipouwhefdskhufdslkjahsdf"
      },
      {
        "id":"sd098wytfskduhdsfDSKfhjw4o8ytwesdoiuhsdf",
        "tag":"Bosch Camera 16",
        "groupid":"",
        "sequencenumber":1,
        "sequencetotal":1,
        "priority":0,
        "timestamp":1234567890123,
        "publisher":"Ayew98wtosdhFSKdjhsdfkjhkjesdhg",
        "authid":"",
        "authgroup":"",
        "version":4,
        "chainposition":0,
        "hash":"",
        "previoushash":"",
        "nonce":"",
        "difficultytarget":0.0,
        "infotype":"image/jpeg",
        "infoformat":"file/.jpg",
        "contextdata":"",
        "contentdata":"sdkjhwrtiy8wrtgSDFOiuhsrgowh4touwsdhsDFDSKJhsdkljasjklweklfjwhefiauhw98p328946982weiusfhsdkufhaskldjfslkjdhfalsjdf=serg4towhr"
      }
    ]
}
```

##### Querystring Parameters

<pre>
None
</pre>

##### POST Parameters

```json
{
  "id": "R4b2WPZRbycCzyZBz9tD7BdMWg94YDhQ",
  "timeframestart": 1234567890123,
  "timeframeend": 1234567890123,
  "publishers": [
    "sefhuiw4984twefsdoiuhsdf",
    "d895y459rwdsifuhSDFKukuewf",
    "SESD984wtsdidsiusidsufgsdfkh"
  ]
}

// Note: The POST value is JSON and must be sent
// with HTTP header set as “Content-Type:application/json”
```


#### Get Control Websocket Connection

This endpoint opens a control Websocket connection for the container. The control commands sent over this Websocket are specified here. It is the responsibility of the container to establish this connection and ensure it is always running. If the container loses the Websocket connection, it should establish a new connection. The Local API is responsible for knowing which Websocket connection belongs to which container so that it can pass information to the appropriate recipients.

The container ID must be passed as part of the URL because otherwise it would have to be passed in the Websocket connection itself and that would make associated connections with container IDs rather difficult.

##### Endpoint

<pre>
ws://iofog:54321/v2/control/socket/id/34t9whefsdfDFKjhw4tiouhwef
</pre>

##### Response

<pre>
None - the Websocket will simply be opened successfully
</pre>

##### Querystring Parameters

<pre>
id - the container ID of the container requesting the Websocket connection (example shown here as 34t9whefsdfDFKjhw4tiouhwef)
</pre>

##### POST Parameters

<pre>
None
</pre>

##### Transmissions From ioFog To Container

<pre>
Standard "Ping" message (op code 9)
Standard "Pong" message (op code 10)
Acknowledgement message (op code 11)
New container configuration available (op code 12)
</pre>

##### Transmissions From Container To ioFog

<pre>
Standard "Ping" message (op code 9)
Standard "Pong" message (op code 10)
Acknowledgement message (op code 11)
</pre>


#### Get Message Websocket Connection

This endpoint opens a message Websocket connection for the container. The messages and other commands sent over this Websocket are specified here. It is the responsibility of the container to establish this connection and ensure it is always running. If the container loses the Websocket connection, it should establish a new connection. The Local API is responsible for knowing which Websocket connection belongs to which container so that it can pass information to the appropriate recipients.

The container ID must be passed as part of the URL because otherwise it would have to be passed in the Websocket connection itself and that would make associated connections with container IDs rather difficult.

##### Endpoint

<pre>
ws://iofog:54321/v2/message/socket/id/34t9whefsdfDFKjhw4tiouhwef
</pre>

##### Response

<pre>
None - the Websocket will simply be opened successfully
</pre>

##### Querystring Parameters

<pre>
id - the container ID of the container requesting the Websocket connection (example shown here as 34t9whefsdfDFKjhw4tiouhwef)
</pre>

##### POST Parameters

<pre>
None
</pre>

##### Transmissions from ioFog to Container

<pre>
Standard "Ping" message (op code 9)
Standard "Pong" message (op code 10)
ioMessage transmission (op code 13 followed by 4 bytes indicating the total length of the message followed by the bytes of the actual ioMessage)
ioMessage receipt transmission (op code 14 followed by 4 bytes indicating the length of the response followed by the actual bytes of the response message containing the ioMessage ID and Timestamp fields with all other fields empty)
</pre>

##### Transmissions from Container to ioFog

<pre>
Standard "Ping" message (op code 9)
Standard "Pong" message (op code 10)
Acknowledgement message (op code 11)
ioMessage transmission (op code 13 followed by 4 bytes indicating the total length of the message followed by the bytes of the actual ioMessage)
</pre>
