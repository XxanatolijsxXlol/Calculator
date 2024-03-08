document.getElementById('showMaterialInputBox').addEventListener('click', function () {
    const materialInputBox = document.getElementById('materialInputBox');
    const form = document.querySelector('.inputbox');

    // Toggle display of material input box
    if (materialInputBox.style.display === 'none') {
        materialInputBox.style.display = 'block';
        form.classList.add('moveToLeft'); // Add animation class to move form to the left
    } else {
        materialInputBox.style.display = 'none';
        form.classList.remove('moveToLeft'); // Remove animation class
        form.classList.add('moveCenter'); // Add animation class to move form back to center
    }
});

let priceLookup = JSON.parse(localStorage.getItem('priceLookup')) || {
    'DC01': 1.2,
    'S235': 1.0,
    'Corten': 1.6,
    'AISI430': 3.20,
    'AISI304': 5,
    'AISI316': 7,
    'Hardox': 2
    // Add more materials as needed
};

let materialCutting; // Declare materialCutting in a scope accessible to both functions

function populateMaterialDropdown() {
    const materialDropdown = document.getElementById('material');
    materialDropdown.innerHTML = '';

    for (const material in priceLookup) {
        const option = document.createElement('option');
        option.value = material;
        option.textContent = material;
        materialDropdown.appendChild(option);
    }
}

function populateMaterialPriceTable() {
    const editableTable = document.getElementById('editableMaterialPriceTable').getElementsByTagName('tbody')[0];
    editableTable.innerHTML = '';

    for (const material in priceLookup) {
        const row = editableTable.insertRow(-1);
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        const cell3 = row.insertCell(2);

        cell1.innerHTML = `<input type="text" class="editable" value="${material}" readonly>`;
        cell2.innerHTML = `<input type="number" class="editable" value="${priceLookup[material]}">`;
        cell3.innerHTML = `<button class="rembtn" onclick="removeMaterialRow(this, '${material}')">Noņemt</button>`;
    }
}

function addMaterialRow() {
    const editableTable = document.getElementById('editableMaterialPriceTable').getElementsByTagName('tbody')[0];
    const row = editableTable.insertRow(-1);
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    const cell3 = row.insertCell(2);

    cell1.innerHTML = '<input type="text" class="editable" placeholder="Materiāla nosaukums">';
    cell2.innerHTML = '<input type="number" class="editable" placeholder="Materiāla cena">';
    cell3.innerHTML = '<button class="rembtn" style="width: 90px;" onclick="removeMaterialRow(this)">Noņemt</button>';
    
    // Reset the text of the "Saglabāts!" button to "Saglabāt"
    const saveButton = document.querySelector('.matbtn:last-of-type');
    saveButton.textContent = 'Saglabāt';
}


function removeMaterialRow(button, material) {
    const row = button.parentNode.parentNode;
    const editableTable = document.getElementById('editableMaterialPriceTable').getElementsByTagName('tbody')[0];

    if (material) {
        delete priceLookup[material];
        populateMaterialDropdown();
    }

    row.parentNode.removeChild(row);
}

function saveMaterialPrices() {
    const editableTable = document.getElementById('editableMaterialPriceTable').getElementsByTagName('tbody')[0];
    const newPriceLookup = {};

    for (let i = 0; i < editableTable.rows.length; i++) {
        const cells = editableTable.rows[i].cells;
        const materialName = cells[0].getElementsByTagName('input')[0].value;
        const materialPrice = parseFloat(cells[1].getElementsByTagName('input')[0].value);

        if (materialName && !isNaN(materialPrice)) {
            newPriceLookup[materialName] = materialPrice;
        }
    }

    // Update the global priceLookup object
    priceLookup = newPriceLookup;

    // Save to local storage if needed
    localStorage.setItem('priceLookup', JSON.stringify(priceLookup));

    // Optional: Display updated material prices in the console
    console.log('Updated Material Prices:', priceLookup);

    // Update material dropdown options
    populateMaterialDropdown();

    // Change the text of the button to "Saglabāts!"
    const saveButton = document.querySelector('.matbtn:last-of-type');
    saveButton.textContent = 'Saglabāts!';
}


function calculate() {
    // Get input values
    const length = parseFloat(document.getElementById('length').value) || 0;
    const width = parseFloat(document.getElementById('width').value) || 0;
    const thickness = parseFloat(document.getElementById('thickness').value) || 0;
    const Koeficent = parseFloat(document.getElementById('Koeficent').value) || 0;
    const count = parseInt(document.getElementById('count').value) || 0;
    const cuttingTime = parseFloat(document.getElementById('cuttingTime').value) || 0;
    const drawingprice = parseFloat(document.getElementById('drawingprice').value) || 0;

    // Check if drawing price, cutting time, and material cutting are valid numbers
    const hasDrawingPrice = !isNaN(drawingprice) && drawingprice !== 0;
    const hasCuttingTime = !isNaN(cuttingTime) && cuttingTime !== 0;

    // Get the selected material
    var selectedMaterial = document.getElementById('material').value;

    // Use the density from the lookup
    const materialprice = priceLookup[selectedMaterial];

    // Calculate material weight (g)
    const materialWeight = (((length * width * thickness * 8) / 1000000) * count).toFixed(3);

    // Calculate area (m3)
    const area = ((length * width) / 1000000);

    var cuttingCoefficient;
    if (area <= 0.01) {
        cuttingCoefficient = 1.3;
    } else {
        cuttingCoefficient = 1.2;
    }

    //materialu cena 1 min
    const materialCutting = hasCuttingTime ? cuttingTime * 1 : 0;

    // Include drawing price in the calculations only if it's a valid number
    const drawingPriceContribution = hasDrawingPrice ? drawingprice * count : 0;

    // Include cutting time in the calculations only if it's a valid number
    const cuttingTimeContribution = hasCuttingTime ? cuttingTime * count : 0;

    //materiala cena 
    const materialfinalprice = (area * thickness * 8 * cuttingCoefficient * materialprice);

    const materiallllll = area * cuttingCoefficient;
    
    //materialu izmaksa
    const materialpayout = (materiallllll * thickness * 8) * count;
    
    //griezanas izmaksas
    const cuttingpayout = (materialfinalprice * Koeficent + drawingPriceContribution + cuttingTimeContribution) * count;

    const nopvn = (cuttingpayout + materialpayout);
    const yespvn = (nopvn * 1.21);

    // Display input values in a new row in the table
    const inputTable = document.getElementById('inputTable');
    const newRow = inputTable.insertRow(+1); // Insert at the last position (-1)
    newRow.innerHTML = `
        <td class="editable" onclick="makeEditable(this)">${selectedMaterial}</td>
        <td class="editable" onclick="makeEditable(this)">${length}</td>
        <td class="editable" onclick="makeEditable(this)">${width}</td>
        <td class="editable" onclick="makeEditable(this)">${thickness}</td>
        <td>${materialWeight}kg</td>
        <td>${area * count}m2</td>
        <td>${count}</td>
        <td class="editable" onclick="makeEditable(this)">${materialCutting * count}€</td>
        <td class="editable" onclick="makeEditable(this)">${cuttingTime * count}min</td>
        <td class="editable" onclick="makeEditable(this)">${drawingPriceContribution.toFixed(2)}€</td>
        <td class="editable" onclick="makeEditable(this)">${cuttingpayout.toFixed(2)}€</td>
        <td class="editable" onclick="makeEditable(this)">${materialpayout.toFixed(2)}€</td>
        <td class="editable" onclick="makeEditable(this)">${nopvn.toFixed(2)}€</td>
        <td class="editable" onclick="makeEditable(this)">${yespvn.toFixed(2)}€</td>
        <td><button class="rembtn" onclick="removeRow(this)">Noņemt</button></td>
    `;

    if (inputTable.rows.length > 2) {
        calculateTotals();
    }

    // Clear input values
    document.getElementById('length').value = '';
    document.getElementById('width').value = '';
    document.getElementById('thickness').value = '';
    document.getElementById('count').value = '';
    document.getElementById('cuttingTime').value = '';
    document.getElementById('drawingprice').value = '';
}


function calculateTotals() {
    const inputTable = document.getElementById('inputTable');
    const rows = inputTable.getElementsByTagName('tr');

    let totals = new Array(15).fill(0); // Initialize an array to store totals for each column

    // Start from 1 to skip the header row
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        if (cells.length >= 15) {
            for (let j = 4; j < 15; j++) { // Start from the 5th column (index 4)
                totals[j] += parseFloat(cells[j].innerText.replace('€', ''));
            }
        }
    }

    // Remove the existing total row if it exists
    const existingTotalRow = document.getElementById('totalRow');
    if (existingTotalRow) {
        existingTotalRow.remove();
    }

    // Display totals in a new row at the end of the table
    const totalRow = inputTable.insertRow(-1);
    totalRow.id = 'totalRow'; // Set an ID for easy removal later
    totalRow.innerHTML = `
        <td colspan="4">Total</td>
        <td>${totals[4].toFixed(2)}kg</td>
        <td>${totals[5].toFixed(2)}m2</td>
        <td>${totals[6]}</td>
        <td>${totals[7].toFixed(2)}€</td>
        <td>${totals[8]}min</td>
        <td>${totals[9]}</td>
        <td>${totals[10].toFixed(2)}€</td>
        <td>${totals[11].toFixed(2)}€</td>
        <td>${totals[12].toFixed(2)}€</td>
        <td>${totals[13].toFixed(2)}€</td>
        
        <td></td>
    `;
}

function removeRow(button) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    calculateTotals();
}

function makeEditable(cell) {
    // Save the original content for later comparison
    const originalContent = cell.textContent;

    cell.contentEditable = true;
    cell.classList.add('editable');
    cell.focus();

    // Add event listener to detect when the user clicks outside the cell
    document.addEventListener('click', function onClickOutside(e) {
        if (!cell.contains(e.target)) {
            // Remove the event listener to avoid interference with other cells
            document.removeEventListener('click', onClickOutside);

            // Disable content editing
            cell.contentEditable = false;
            cell.classList.remove('editable');

            // Check if the content has changed
            if (originalContent !== cell.textContent) {
                // Recalculate the row and update the table
                recalculateRow(cell.parentNode);
                calculateTotals();
            }
        }
    });
}

function recalculateRow(row) {
    // Get the input values from the row
    const length = parseFloat(row.cells[1].textContent) || 0;
    const width = parseFloat(row.cells[2].textContent) || 0;
    const thickness = parseFloat(row.cells[3].textContent) || 0;
    const Koeficent = parseFloat(document.getElementById('Koeficent').value) || 0;
    const count = parseInt(row.cells[6].textContent) || 0;
    const cuttingTime = parseFloat(row.cells[8].textContent) || 0;
    const drawingprice = parseFloat(row.cells[9].textContent) || 0;

    // Check if drawing price, cutting time, and material cutting are valid numbers
    const hasDrawingPrice = !isNaN(drawingprice) && drawingprice !== 0;
    const hasCuttingTime = !isNaN(cuttingTime) && cuttingTime !== 0;

    // Get the selected material
    var selectedMaterial = row.cells[0].textContent;

    // Use the density from the lookup
    const materialprice = priceLookup[selectedMaterial];

    // Calculate material weight (g)
    const materialWeight = (((length * width * thickness * 8) / 1000000) * count).toFixed(3);

    // Calculate area (m3)
    const area = ((length * width) / 1000000);

    var cuttingCoefficient;
    if (area <= 0.01) {
        cuttingCoefficient = 1.3;
    } else {
        cuttingCoefficient = 1.2;
    }

    //materialu cena 1 min
    const materialCutting = hasCuttingTime ? cuttingTime * 1 : 0;

    // Include drawing price in the calculations only if it's a valid number
    const drawingPriceContribution = hasDrawingPrice ? drawingprice * count : 0;

    // Include cutting time in the calculations only if it's a valid number
    const cuttingTimeContribution = hasCuttingTime ? cuttingTime * count : 0;

    //materiala cena 
    const materialfinalprice = (area * thickness * 8 * cuttingCoefficient * materialprice);

    const materiallllll = area * cuttingCoefficient;

    //materialu izmaksa
    const materialpayout = (materiallllll * thickness * 8) * count;

    //griezanas izmaksas
    const cuttingpayout = (materialfinalprice * Koeficent + materialCutting + drawingPriceContribution + cuttingTimeContribution) * count;

    const nopvn = (cuttingpayout + materialpayout);
    const yespvn = (nopvn * 1.21);

    // Update the row with the recalculated values
    row.cells[4].textContent = `${materialWeight}kg`;
    row.cells[5].textContent = `${(area * count).toFixed(2)}m2`;
    row.cells[7].textContent = `${materialCutting * count}€`;
    row.cells[10].textContent = `${cuttingpayout.toFixed(2)}€`;
    row.cells[11].textContent = `${materialpayout.toFixed(2)}€`;
    row.cells[12].textContent = `${nopvn.toFixed(2)}€`;
    row.cells[13].textContent = `${yespvn.toFixed(2)}€`;

    // Save the edited values back to the table
    row.cells[1].textContent = length;
    row.cells[2].textContent = width;
    row.cells[3].textContent = thickness;
    row.cells[8].textContent = cuttingTime;
    row.cells[9].textContent = drawingprice;
}

document.getElementById('exportButton').addEventListener('click', function () {
    var table2excel = new Table2Excel();
    table2excel.export(document.getElementById('inputTable'));
});

populateMaterialPriceTable();
populateMaterialDropdown();

// JavaScript to handle label highlighting
const inputFields = document.querySelectorAll('.inputbox input');

inputFields.forEach(input => {
    input.addEventListener('focus', function() {
        const label = this.previousElementSibling;
        label.classList.add('highlighted-label');
    });

    input.addEventListener('blur', function() {
        const label = this.previousElementSibling;
        label.classList.remove('highlighted-label');
    });
});
