// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title ProductPass
/// @notice Verifiable digital passport for products: registration, sale, warranty and maintenance history.
contract ProductPass {
    enum Role {
        Admin,
        Manufacturer,
        Retailer,
        ServiceCenter
    }

    enum ProductStatus {
        Manufactured,
        Sold,
        Serviced
    }

    enum HistoryEventType {
        Registered,
        Sold,
        Maintenance
    }

    struct Product {
        string productId;
        string serialNumber;
        string name;
        string model;
        address manufacturer;
        uint256 manufacturedAt;
        uint256 soldAt;
        uint256 warrantyExpiresAt;
        ProductStatus status;
        uint256 maintenanceCount;
    }

    /// @dev `status` is the product status right after the event, so the history keeps every
    /// status the product went through even when a later event replaces the current one.
    struct HistoryEntry {
        HistoryEventType eventType;
        ProductStatus status;
        address actor;
        uint256 timestamp;
        string details;
    }

    uint256 public constant SECONDS_PER_MONTH = 30 days;
    uint256 public constant MAX_WARRANTY_MONTHS = 120;
    /// @dev Text limits are in bytes (UTF-8): accented letters take 2 bytes.
    uint256 public constant MAX_TEXT_LENGTH = 64;
    uint256 public constant MAX_DESCRIPTION_LENGTH = 140;

    uint256 public totalProducts;

    /// @notice Public name of each participant, required when a role is granted.
    mapping(address account => string name) public participantNames;

    mapping(address account => mapping(Role role => bool granted)) private roles;
    mapping(bytes32 productKey => Product product) private products;
    mapping(bytes32 productKey => HistoryEntry[] entries) private histories;

    event RoleGranted(
        address indexed account,
        Role indexed role,
        address indexed grantedBy,
        string participantName
    );
    event ProductRegistered(
        bytes32 indexed productKey,
        string productId,
        string serialNumber,
        address indexed manufacturer,
        uint256 timestamp
    );
    event ProductSold(
        bytes32 indexed productKey,
        string productId,
        address indexed retailer,
        uint256 warrantyExpiresAt,
        uint256 timestamp
    );
    event MaintenanceRegistered(
        bytes32 indexed productKey,
        string productId,
        address indexed serviceCenter,
        string description,
        uint256 timestamp
    );

    error MissingRole(address account, Role role);
    error RoleAlreadyGranted(address account, Role role);
    error InvalidAccount();
    error EmptyField(string field);
    error FieldTooLong(string field, uint256 maxLength);
    error UntrimmedField(string field);
    error ProductAlreadyExists(string productId);
    error ProductNotFound(string productId);
    error ProductAlreadySold(string productId);
    error InvalidWarrantyDuration(uint256 months);

    modifier onlyRole(Role role) {
        if (!roles[msg.sender][role]) revert MissingRole(msg.sender, role);
        _;
    }

    modifier onlyExistingProduct(string calldata productId) {
        if (!_exists(_keyOf(productId))) revert ProductNotFound(productId);
        _;
    }

    constructor(string memory adminName) {
        _requireValidText(adminName, "participantName", MAX_TEXT_LENGTH);
        _grantRole(msg.sender, Role.Admin, adminName);
    }

    /// @notice Authorizes `account` for `role`. The name is required and replaces any previous one.
    function grantRole(address account, Role role, string calldata name) external onlyRole(Role.Admin) {
        if (account == address(0)) revert InvalidAccount();
        if (roles[account][role]) revert RoleAlreadyGranted(account, role);
        _requireValidText(name, "participantName", MAX_TEXT_LENGTH);
        _grantRole(account, role, name);
    }

    function registerProduct(
        string calldata productId,
        string calldata serialNumber,
        string calldata name,
        string calldata model
    ) external onlyRole(Role.Manufacturer) {
        _requireValidText(productId, "productId", MAX_TEXT_LENGTH);
        _requireValidText(serialNumber, "serialNumber", MAX_TEXT_LENGTH);
        _requireValidText(name, "name", MAX_TEXT_LENGTH);
        _requireValidText(model, "model", MAX_TEXT_LENGTH);

        bytes32 key = _keyOf(productId);
        if (_exists(key)) revert ProductAlreadyExists(productId);

        Product storage product = products[key];
        product.productId = productId;
        product.serialNumber = serialNumber;
        product.name = name;
        product.model = model;
        product.manufacturer = msg.sender;
        product.manufacturedAt = block.timestamp;
        product.status = ProductStatus.Manufactured;
        totalProducts++;

        _appendHistory(key, HistoryEventType.Registered, ProductStatus.Manufactured, "");
        emit ProductRegistered(key, productId, serialNumber, msg.sender, block.timestamp);
    }

    /// @notice Records the sale and starts the warranty. The current status becomes Sold even if
    /// the product was serviced before; the earlier status stays in the history.
    function registerSale(
        string calldata productId,
        uint256 warrantyMonths
    ) external onlyRole(Role.Retailer) onlyExistingProduct(productId) {
        if (warrantyMonths == 0 || warrantyMonths > MAX_WARRANTY_MONTHS) {
            revert InvalidWarrantyDuration(warrantyMonths);
        }

        bytes32 key = _keyOf(productId);
        Product storage product = products[key];
        if (product.soldAt != 0) revert ProductAlreadySold(productId);

        product.soldAt = block.timestamp;
        product.warrantyExpiresAt = block.timestamp + warrantyMonths * SECONDS_PER_MONTH;
        product.status = ProductStatus.Sold;

        _appendHistory(key, HistoryEventType.Sold, ProductStatus.Sold, "");
        emit ProductSold(key, productId, msg.sender, product.warrantyExpiresAt, block.timestamp);
    }

    function registerMaintenance(
        string calldata productId,
        string calldata description
    ) external onlyRole(Role.ServiceCenter) onlyExistingProduct(productId) {
        _requireValidText(description, "description", MAX_DESCRIPTION_LENGTH);

        bytes32 key = _keyOf(productId);
        Product storage product = products[key];
        product.maintenanceCount++;
        product.status = ProductStatus.Serviced;

        _appendHistory(key, HistoryEventType.Maintenance, ProductStatus.Serviced, description);
        emit MaintenanceRegistered(key, productId, msg.sender, description, block.timestamp);
    }

    function getProduct(
        string calldata productId
    ) external view onlyExistingProduct(productId) returns (Product memory) {
        return products[_keyOf(productId)];
    }

    function getProductHistory(
        string calldata productId
    ) external view onlyExistingProduct(productId) returns (HistoryEntry[] memory) {
        return histories[_keyOf(productId)];
    }

    function hasRole(address account, Role role) external view returns (bool) {
        return roles[account][role];
    }

    function _grantRole(address account, Role role, string memory name) private {
        roles[account][role] = true;
        participantNames[account] = name;
        emit RoleGranted(account, role, msg.sender, name);
    }

    function _appendHistory(
        bytes32 key,
        HistoryEventType eventType,
        ProductStatus status,
        string memory details
    ) private {
        histories[key].push(HistoryEntry(eventType, status, msg.sender, block.timestamp, details));
    }

    function _exists(bytes32 key) private view returns (bool) {
        return products[key].manufacturer != address(0);
    }

    function _keyOf(string calldata productId) private pure returns (bytes32) {
        return keccak256(bytes(productId));
    }

    /// @dev Required, at most `maxLength` bytes, and without leading or trailing whitespace
    /// (which also rejects values made only of spaces).
    function _requireValidText(string memory value, string memory field, uint256 maxLength) private pure {
        bytes memory raw = bytes(value);
        if (raw.length == 0) revert EmptyField(field);
        if (raw.length > maxLength) revert FieldTooLong(field, maxLength);
        if (_isWhitespace(raw[0]) || _isWhitespace(raw[raw.length - 1])) revert UntrimmedField(field);
    }

    function _isWhitespace(bytes1 char) private pure returns (bool) {
        return char == 0x20 || char == 0x09 || char == 0x0A || char == 0x0D;
    }
}
