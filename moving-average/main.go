package main

import (
	//"encoding/json"
	//"errors"
	"fmt"
	"log"
	"os"
	//"strconv"
	//"strings"
	"sync"
	sdk "github.com/ioFog/iofog-go-sdk"
)

var (
	logger              = log.New(os.Stderr, "", log.LstdFlags)
	containerConfig     map[string]interface{}
	configMutex         = sync.RWMutex{}
	client, clientError = sdk.NewDefaultIoFogClient()
)

type Config struct {
	Selections []Selection `json:"selections"`
}

type Selection struct {
	InputType    string   `json:"inputtype"`
	InputFormat  string   `json:"inputformat"`
	OutputType   string   `json:"outputtype"`
	OutputFormat string   `json:"outputformat"`
	Outputs      []Output `json:"outputs"`
}

type Output struct {
	SubSelection    string `json:"subselection"`
	OutputJSONArray bool   `json:"outputjsonarray"`
	FieldName       string `json:"fieldname"`
}

func main() {
	if clientError != nil {
		logger.Println(clientError.Error())
		return
	}

	updateConfig()

	go func() {
		confChannel := client.EstablishControlWsConnection(0)
		for {
			select {
			case <-confChannel:
				updateConfig()
			}
		}
	}()

	messageChannel, receiptChannel := client.EstablishMessageWsConnection(0, 0)
	for {
		select {
		case msg := <-messageChannel:
			go func() {
				logger.Println(msg)
				/* selected, err := buildMessage(msg)
				if err != nil {
					logger.Println(err.Error())
				} else {
					client.SendMessageViaSocket(selected)
				} */
			}()
		case <-receiptChannel:

		}
	}

}

func updateConfig() {
	attemptLimit := 5
	var config map[string]interface{}
	var err error

	for config, err = client.GetConfig(); err != nil && attemptLimit > 0; attemptLimit-- {
		logger.Println(err.Error())
	}

	if attemptLimit == 0 {
		logger.Println("Update config failed")
		return
	}

	configMutex.Lock()
	containerConfig = config
	configMutex.Unlock()

	fmt.Println("Config: ", config)

	/* config := new(Config)
	configMutex.RLock()
	configBytes, err := json.Marshal(containerConfig)
	configMutex.RUnlock()

	if err != nil {
		return nil, err
	} else if err = json.Unmarshal(configBytes, config); err != nil {
		return nil, err
	} */
}
