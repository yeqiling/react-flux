import { Button, Layout, Notification } from "@arco-design/web-react"
import { useStore } from "@nanostores/react"
import { useEffect } from "react"

import "./App.css"
import Main from "./components/Main/Main"
import Sidebar from "./components/Sidebar/Sidebar"
import useFeedIconsSync from "./hooks/useFeedIconsSync"
import useLanguage, { polyglotState } from "./hooks/useLanguage"
import useScreenWidth from "./hooks/useScreenWidth"
import useTheme from "./hooks/useTheme"
import useVersionCheck from "./hooks/useVersionCheck"
import { GITHUB_REPO_PATH } from "./utils/constants"
import hideSpinner from "./utils/loading"

const App = () => {
  useLanguage()
  useTheme()
  useFeedIconsSync()

  const { hasUpdate, dismissUpdate } = useVersionCheck()

  const { isBelowLarge } = useScreenWidth()

  const { polyglot } = useStore(polyglotState)

  useEffect(() => {
    hideSpinner()
  }, [])

  useEffect(() => {
    if (hasUpdate) {
      const id = "new-version-available"
      Notification.info({
        id,
        title: polyglot.t("app.new_version_available"),
        closable: false,
        content: polyglot.t("app.new_version_available_description"),
        duration: 0,
        btn: (
          <span>
            <Button
              size="small"
              style={{ marginRight: 8 }}
              type="secondary"
              onClick={() => {
                dismissUpdate()
                Notification.remove(id)
              }}
            >
              {polyglot.t("actions.dismiss")}
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={() => {
                window.open(`https://github.com/${GITHUB_REPO_PATH}/commits/main`, "_blank")
                Notification.remove(id)
              }}
            >
              {polyglot.t("actions.check")}
            </Button>
          </span>
        ),
      })
    }
  }, [dismissUpdate, hasUpdate, polyglot])

  return (
    polyglot && (
      <div className="app">
        {isBelowLarge ? null : (
          <Layout.Sider
            breakpoint="lg"
            className="sidebar"
            collapsible={false}
            trigger={null}
            width={240}
          >
            <Sidebar />
          </Layout.Sider>
        )}
        <Main />
      </div>
    )
  )
}

export default App
