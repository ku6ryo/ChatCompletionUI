"use client"
import { MouseEventHandler, useEffect, useMemo, useRef, useState } from "react"
import styles from "./page.module.scss"
import { throttle } from "throttle-debounce"
import { checkApiKey, countTokens, getChatCompletion } from "@/utils/api"
import { OpenAiMessage } from "@/types/OpenAiMessage"
import { deleteApiKey, deleteSysMessage, getApiKey, getSysMessage, saveApiKey, saveSysMessage } from "@/utils/storage"
import { GrRobot, GrUserManager, GrSend, GrKey } from "react-icons/gr"
import classnames from "classnames"

type MessageWithTokenCount = OpenAiMessage & { tokens: number }

const TOKEN_LIMIT = 4000

export default function Home() {
  const [apiKey, setApiKey] = useState("")
  const [apiKeyValid, setApiKeyValid] = useState(false)
  const [sysTextTokens, setSysTextTokens] = useState(0)
  const [sysText, setSysText] = useState("")
  const [userTextTokens, setUserTextTokens] = useState(0)
  const [userText, setUserText] = useState("")
  const [messages, setMessages] = useState<MessageWithTokenCount[]>([])
  const [thinking, setThinking] = useState(false)

  useEffect(() => {
    ;(async () => {
      const apiKey = getApiKey()
      if (apiKey) {
        setApiKey(apiKey)
        const valid = await checkApiKey(apiKey)
        setApiKeyValid(valid)
      }
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      const sysMessage = getSysMessage()
      if (sysMessage) {
        setSysText(sysMessage)
        throttleSysTokenCheck(sysMessage)
      }
    })()
  }, [])

  useEffect(() => {
    if (frameRef.current) {
      frameRef.current.scrollTop = frameRef.current.scrollHeight
    }
  }, [messages])

  const throttleSysTokenCheck = useMemo(() => {
    return throttle(1000, async (text: string) => {
      const count = await countTokens(text)
      setSysTextTokens(count)
    })  
  }, [])

  const onSysTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value
    setSysText(v)
    saveSysMessage(v)
    throttleSysTokenCheck(e.target.value)
  }

  const throttleUserTokenCheck = useMemo(() => {
    return throttle(1000, async (text: string) => {
      const count = await countTokens(text)
      setUserTextTokens(count)
    })  
  }, [])

  const onUserTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value
    setUserText(v)
    throttleUserTokenCheck(e.target.value)
  }

  const onApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setApiKey(v)
    setApiKeyValid(false)
  }

  const onApiKeyCheckClick: MouseEventHandler<HTMLButtonElement> = async (e) => {
    const valid = await checkApiKey(apiKey)
    setApiKeyValid(valid)
    if (valid) {
      setApiKey(apiKey)
      saveApiKey(apiKey)
    }
  }

  const onSubmitClick: MouseEventHandler<HTMLButtonElement> = async (e) => {
    let tokensToUse = sysTextTokens + userTextTokens
    const messagesToInclude: MessageWithTokenCount[] = []
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i]
      if (m.tokens + tokensToUse > TOKEN_LIMIT) {
        break
      }
      messagesToInclude.push(m)
      tokensToUse += m.tokens
    }
    console.log(`Using ${tokensToUse} tokens`)

    setThinking(true)
    try {
      const { answer, tokens } = await getChatCompletion(apiKey, [
        {
          role: "system",
          content: sysText
        },
        ...messagesToInclude.map(m => ({ role: m.role, content: m.content })),
        {
          role: "user",
          content: userText,
        }])
      setMessages([
        ...messages,
        { role: "user", content: userText, tokens: userTextTokens },
        { role: "assistant", content: answer, tokens, }
      ])
      setUserText("")
      setUserTextTokens(0)
    } catch (e) {
    } finally {
      setThinking(false)
    }
  }

  const onOpenSettingsClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    setApiKeyValid(false)
  }

  const onClearSettingsClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    setApiKey("")
    deleteApiKey()
    deleteSysMessage()
  }

  const onClearHistoryClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    setMessages([])
  }

  const frameRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <div className={styles.header}>
        <button onClick={onOpenSettingsClick}>
          <span>API KEY</span>
          &nbsp;
          <GrKey />
        </button>
      </div>
      {!apiKeyValid && (
        <div className={styles.settingModal}>
          <div className={styles.modal}>
            <div className={styles.title}>Open AI API key setting</div>
            <div>
              <input onChange={onApiKeyChange} value={apiKey}></input>
            </div>
            <div>
              <button onClick={onApiKeyCheckClick}>Validate the key and start</button>
              <button onClick={onClearSettingsClick}>Clear</button>
            </div>
          </div>
        </div>
      )}
      <div className={styles.frame} ref={frameRef}>
        <div className={styles.widthAdjuster}>
          <div>Role Text</div>
          <div>
            <textarea
              onChange={onSysTextChange}
              value={sysText}
            />
          </div>
          <div className={styles.tokens}>{sysTextTokens} tokens</div>
        </div>
        <div className={styles.widthAdjuster}>
          <div className={styles.messageContainer}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  classnames({
                    [styles.message]: true,
                    [styles[m.role]]: true,
                  })
                }
              >
                <div className={styles.role}>
                  {m.role === "assistant" ? <GrRobot /> : <GrUserManager />}
                </div>
                <div className={styles.text}>
                  <div>{m.content}</div>
                  <div className={styles.tokens}>{m.tokens} tokens</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.bottomBar}>
        <div className={styles.widthAdjuster}>
          <div className={styles.inputArea}>
            <div>
              <textarea
                onChange={onUserTextChange}
                value={userText}
                disabled={thinking}
              />
            </div>
            <div className={styles.tokens}>{userTextTokens} tokens</div>
            <button
              className={styles.submitButton}
              onClick={onSubmitClick}
              disabled={!userText || thinking}
            >
              <GrSend />
            </button>
            <div>
              <button onClick={onClearHistoryClick}>Clear conversation</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
