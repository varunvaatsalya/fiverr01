import React from 'react'

function EditReportForm({setNewUserSection,editReport}) {
  return (
    <div>
      pending
      <div className="flex px-4 gap-3 justify-end">
          <div
            className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
            onClick={() => {
              setNewUserSection((prev) => !prev);
            }}
          >
            Cancel
          </div>
          {/* <button
            type="submit"
            className="w-20 h-8 py-1 flex items-center justify-center gap-2 bg-red-500 rounded-lg font-semibold cursor-pointer text-white"
            disabled={submitting}
          >
            {submitting ? <Loading size={15} /> : <></>}
            {submitting ? "Wait..." : "Submit"}
          </button> */}
        </div>
    </div>
  )
}

export default EditReportForm
