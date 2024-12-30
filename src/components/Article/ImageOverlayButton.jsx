import { Tag, Tooltip } from "@arco-design/web-react"
import { IconLink } from "@arco-design/web-react/icon"
import { useStore } from "@nanostores/react"
import { useEffect, useState } from "react"

import { settingsState } from "@/store/settingsState"
import { MIN_THUMBNAIL_SIZE } from "@/utils/constants"

import "./ImageOverlayButton.css"

const ImageComponent = ({ imgNode, isIcon, isBigImage, index, togglePhotoSlider }) => {
  const { fontSize } = useStore(settingsState)

  return isIcon ? (
    <img
      {...imgNode.attribs}
      alt={imgNode.attribs.alt ?? "image"}
      className="icon-image"
      style={{
        height: `${fontSize}rem`,
      }}
    />
  ) : (
    <div style={{ position: "relative" }}>
      <img
        {...imgNode.attribs}
        alt={imgNode.attribs.alt ?? "image"}
        className={isBigImage ? "big-image" : ""}
      />
      <button
        className="image-overlay-button"
        type="button"
        onClick={(event) => {
          event.preventDefault()
          togglePhotoSlider(index)
        }}
      />
    </div>
  )
}

const findImageNode = (node, isLinkWrapper) =>
  isLinkWrapper ? node.children.find((child) => child.type === "tag" && child.name === "img") : node

const ImageOverlayButton = ({ node, index, togglePhotoSlider, isLinkWrapper = false }) => {
  const [isIcon, setIsIcon] = useState(false)
  const [isBigImage, setIsBigImage] = useState(false)

  const imgNode = findImageNode(node, isLinkWrapper)

  useEffect(() => {
    let isSubscribed = true

    const imgNode = findImageNode(node, isLinkWrapper)
    const imgSrc = imgNode.attribs.src
    const img = new Image()
    img.src = imgSrc

    img.onload = () => {
      if (isSubscribed) {
        const isSmall = Math.max(img.width, img.height) <= MIN_THUMBNAIL_SIZE
        const isLarge = img.width > 768

        setIsIcon(isSmall)
        setIsBigImage(isLarge && !isSmall)
      }
    }

    return () => {
      isSubscribed = false
      img.src = ""
      img.onload = null
    }
  }, [node, isLinkWrapper])

  if (isIcon) {
    return isLinkWrapper ? (
      <a {...node.attribs}>
        <ImageComponent
          imgNode={imgNode}
          index={index}
          isBigImage={isBigImage}
          isIcon={isIcon}
          togglePhotoSlider={togglePhotoSlider}
        />
        {node.children[1]?.data}
      </a>
    ) : (
      <ImageComponent
        imgNode={imgNode}
        index={index}
        isBigImage={isBigImage}
        isIcon={isIcon}
        togglePhotoSlider={togglePhotoSlider}
      />
    )
  }

  return (
    <div className="image-wrapper">
      <div className="image-container">
        {isLinkWrapper ? (
          <div>
            <ImageComponent
              imgNode={imgNode}
              index={index}
              isBigImage={isBigImage}
              isIcon={isIcon}
              togglePhotoSlider={togglePhotoSlider}
            />
            {node.attribs.href !== "#" && (
              <Tooltip content={node.attribs.href}>
                <Tag
                  className="link-tag"
                  icon={<IconLink />}
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(node.attribs.href, "_blank")
                  }}
                >
                  {node.attribs.href}
                </Tag>
              </Tooltip>
            )}
          </div>
        ) : (
          <ImageComponent
            imgNode={imgNode}
            index={index}
            isBigImage={isBigImage}
            isIcon={isIcon}
            togglePhotoSlider={togglePhotoSlider}
          />
        )}
      </div>
    </div>
  )
}

export default ImageOverlayButton
