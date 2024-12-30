import { Form, Input, Message, Modal, Switch, Tag } from "@arco-design/web-react"
import { IconPlus } from "@arco-design/web-react/icon"
import { useStore } from "@nanostores/react"
import { useState } from "react"

import { addCategory, deleteCategory, updateCategory } from "@/apis"
import { polyglotState } from "@/hooks/useLanguage"
import { categoriesState, setCategoriesData, setFeedsData } from "@/store/dataState"
import "./CategoryList.css"

const CategoryList = () => {
  const categories = useStore(categoriesState)
  const { polyglot } = useStore(polyglotState)

  const [categoryForm] = Form.useForm()
  const [categoryModalVisible, setCategoryModalVisible] = useState(false)
  const [inputAddValue, setInputAddValue] = useState("")
  const [selectedCategory, setSelectedCategory] = useState({})
  const [showAddInput, setShowAddInput] = useState(false)

  const addNewCategory = async () => {
    if (!inputAddValue.trim()) {
      setShowAddInput(false)
      return
    }

    try {
      const data = await addCategory(inputAddValue)
      setCategoriesData((prevCategories) => [...prevCategories, { ...data }])
      Message.success(polyglot.t("category_list.add_category_success"))
    } catch (error) {
      console.error(`${polyglot.t("category_list.add_category_error")}: `, error)
      Message.error(polyglot.t("category_list.add_category_error"))
    }
    setInputAddValue("")
    setShowAddInput(false)
  }

  const editCategory = async (categoryId, newTitle, hidden) => {
    try {
      const data = await updateCategory(categoryId, newTitle, hidden)
      setFeedsData((prevFeeds) =>
        prevFeeds.map((feed) =>
          feed.category.id === categoryId
            ? {
                ...feed,
                category: {
                  ...feed.category,
                  title: newTitle,
                  hide_globally: hidden,
                },
              }
            : feed,
        ),
      )
      setCategoriesData((prevCategories) =>
        prevCategories.map((category) =>
          category.id === categoryId ? { ...category, ...data } : category,
        ),
      )
      Message.success(polyglot.t("category_list.update_category_success"))
    } catch {
      Message.error(polyglot.t("category_list.update_category_error"))
    }

    setCategoryModalVisible(false)
    categoryForm.resetFields()
  }

  const removeCategory = async (category) => {
    try {
      const response = await deleteCategory(category.id)
      if (response.status === 204) {
        setCategoriesData((prevCategories) => prevCategories.filter((c) => c.id !== category.id))
        Message.success(
          polyglot.t("category_list.remove_category_success", {
            title: category.title,
          }),
        )
      } else {
        Message.error(
          polyglot.t("category_list.remove_category_error", {
            title: category.title,
          }),
        )
      }
    } catch (error) {
      console.error(
        polyglot.t("category_list.remove_category_error", {
          title: category.title,
        }),
        error,
      )
      Message.error(
        polyglot.t("category_list.remove_category_error", {
          title: category.title,
        }),
      )
    }
  }

  return (
    <>
      <div>
        {categories.map((category) => (
          <Tag
            key={category.id}
            className="tag-style"
            closable={category.feedCount === 0}
            size="medium"
            onClick={() => {
              setSelectedCategory(category)
              setCategoryModalVisible(true)
              categoryForm.setFieldsValue({
                title: category.title,
              })
            }}
            onClose={async (event) => {
              event.stopPropagation()
              await removeCategory(category)
            }}
          >
            {category.title}
          </Tag>
        ))}
        {showAddInput ? (
          <Input
            autoFocus
            className="input-style"
            size="small"
            value={inputAddValue}
            onBlur={addNewCategory}
            onChange={setInputAddValue}
            onPressEnter={addNewCategory}
          />
        ) : (
          <Tag
            className="add-category-tag"
            icon={<IconPlus />}
            size="medium"
            tabIndex={0}
            onClick={() => setShowAddInput(true)}
          />
        )}
      </div>
      {selectedCategory && (
        <Modal
          unmountOnExit
          className="modal-style"
          title={polyglot.t("category_list.edit_category_title")}
          visible={categoryModalVisible}
          onOk={categoryForm.submit}
          onCancel={() => {
            setCategoryModalVisible(false)
            categoryForm.resetFields()
          }}
        >
          <Form
            form={categoryForm}
            layout="vertical"
            labelCol={{
              style: { flexBasis: 90 },
            }}
            wrapperCol={{
              style: { flexBasis: "calc(100% - 90px)" },
            }}
            onSubmit={(values) => editCategory(selectedCategory.id, values.title, values.hidden)}
          >
            <Form.Item
              field="title"
              label={polyglot.t("category_list.edit_category_title_label")}
              rules={[{ required: true }]}
            >
              <Input placeholder={polyglot.t("category_list.edit_category_title_placeholder")} />
            </Form.Item>
            <Form.Item
              field="hidden"
              initialValue={selectedCategory.hide_globally}
              label={polyglot.t("category_list.edit_category_hidden_label")}
              rules={[{ type: "boolean" }]}
              triggerPropName="checked"
            >
              <Switch />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </>
  )
}

export default CategoryList
