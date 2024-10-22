import { formatDateTimeToIST } from "../utils/date";

function Report({ blankPrescPrint, setBlankPrescPrint }) {
  return (
    <div>
      <div className="flex justify-center space-x-2 print-btn">
        <button
          onClick={() => {
            window.print();
          }}
          className="bg-blue-600 hover:bg-blue-500 rounded px-6 py-2 my-2 font-semibold text-lg text-white"
        >
          Print
        </button>
        <button
          onClick={() => {
            setBlankPrescPrint(null);
          }}
          className="bg-red-600 hover:bg-red-500 rounded px-4 py-2 my-2 font-semibold text-lg text-white"
        >
          Cancel
        </button>
      </div>
          <div class="max-w-4xl mx-auto bg-white text-black p-8 rounded-lg shadow-lg">
            <h1 class="text-2xl font-bold mb-8">
              Prescription
            </h1>

            <div class=" mb-6">
              <p class="text-base">
                <span class="font-semibold">Patient: </span>
                {blankPrescPrint.patient.name}
              </p>
              <p class="text-base">
                <span class="font-semibold">UHID: </span>
                {blankPrescPrint.patient.uhid}
              </p>
              <p class="text-base capitalize">
                <span class="font-semibold">Gender/Age: </span>
                {blankPrescPrint.patient?.gender[0] +
                  "/" +
                  blankPrescPrint.patient.age}
              </p>
              <p class="text-base">
                <span class="font-semibold">Mo. No.: </span>
                {blankPrescPrint.patient.mobileNumber}
              </p>
              <p class="text-base">
                <span class="font-semibold">Address: </span>
                {blankPrescPrint.patient?.address}
              </p>
            </div>

            <div class="mb-6">
              <p class="text-base">
                <span class="font-semibold">PID#: </span>
                {blankPrescPrint.pid}
              </p>
              <p class="text-base">
                <span class="font-semibold">Doctor: </span>
                {"Dr. " + blankPrescPrint.doctor.name}
              </p>
              <p class="text-base">
                <span class="font-semibold">Department: </span>
                {"Dr. " + blankPrescPrint.department.name}
              </p>
              <p class="text-base">
                <span class="font-semibold">Date Requested: </span>
                {formatDateTimeToIST(blankPrescPrint.createdAt)}
              </p>
            </div>
          </div>
    </div>
  );
}

export default Report;
